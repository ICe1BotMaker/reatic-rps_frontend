"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type { LucideIcon } from "lucide-react";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    CalendarClockIcon,
    HistoryIcon,
    ListTreeIcon,
    Loader2,
    MoreVertical,
    PauseCircleIcon,
    PlayCircleIcon,
    Plus,
    Search,
    UsersRoundIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DefaultResponse } from "@/api/types";
import { getSeasons, createSeason } from "@/features/season/api";
import type { SeasonsResponse } from "@/features/season/types";
import { pauseSeason, resumeSeason } from "@/features/admin/season/api";
import {
    useSeasonLogs,
    useSeasonParticipants,
} from "@/features/admin/season/hooks";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50];
const DEFAULT_SORT: SortState = { field: "startDateTime", direction: "desc" };
const DEFAULT_LOG_SORT: LogSortState = {
    field: "createdAt",
    direction: "desc",
};

const STATUS_BADGE_STYLES: Record<
    SeasonStatus,
    { variant: BadgeVariant; className?: string }
> = {
    ACTIVE: {
        variant: "secondary",
        className: "border-transparent bg-emerald-500/10 text-emerald-600",
    },
    PAUSED: {
        variant: "secondary",
        className: "border-transparent bg-amber-500/15 text-amber-600",
    },
    INACTIVE: {
        variant: "outline",
        className: "border-dashed text-muted-foreground",
    },
};

const STATUS_LABELS: Record<SeasonStatus, string> = {
    ACTIVE: "진행중",
    PAUSED: "일시중지",
    INACTIVE: "종료",
};

const STATUS_ORDER: Record<SeasonStatus, number> = {
    ACTIVE: 0,
    PAUSED: 1,
    INACTIVE: 2,
};

const ROLE_BADGE = {
    ADMIN: "border-transparent bg-sky-500/15 text-sky-600",
    USER: "border-border/60 bg-muted/60 text-muted-foreground",
} as const;

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
type Season = SeasonsResponse[number];
type SeasonStatus = "ACTIVE" | "PAUSED" | "INACTIVE";
type SortField =
    | "status"
    | "seasonName"
    | "startDateTime"
    | "endDateTime"
    | "createdAt";
type SortDirection = "asc" | "desc";
type SortState = { field: SortField; direction: SortDirection };
type LogSortField =
    | "gameId"
    | "memberEmail"
    | "winningStreak"
    | "createdAt"
    | "active";
type LogSortState = { field: LogSortField; direction: SortDirection };
type ErrorDialogState = {
    open: boolean;
    title: string;
    message: string;
};
type SeasonFormState = {
    seasonName: string;
    startDate: string;
    endDate: string;
};
type SummaryCard = {
    key: string;
    label: string;
    value: string;
    helper?: string;
    icon: LucideIcon;
    iconClassName?: string;
};

export default function SeasonManagementPage() {
    const queryClient = useQueryClient();

    const {
        data: seasonsResponse,
        isLoading: isSeasonsLoading,
        isFetching: isSeasonsFetching,
    } = useQuery({
        queryKey: ["seasons"],
        queryFn: getSeasons,
        retry: false,
    });

    const seasons = useMemo(
        () => seasonsResponse?.data ?? [],
        [seasonsResponse?.data]
    );

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<SeasonStatus | "all">(
        "all"
    );
    const [sortState, setSortState] = useState<SortState>(DEFAULT_SORT);

    const [createSeasonDialogOpen, setCreateSeasonDialogOpen] = useState(false);
    const [newSeason, setNewSeason] = useState<SeasonFormState>({
        seasonName: "",
        startDate: "",
        endDate: "",
    });

    const [participantsSeason, setParticipantsSeason] = useState<Season | null>(
        null
    );
    const [logsSeason, setLogsSeason] = useState<Season | null>(null);
    const [logSortState, setLogSortState] =
        useState<LogSortState>(DEFAULT_LOG_SORT);
    const [errorDialog, setErrorDialog] = useState<ErrorDialogState>({
        open: false,
        title: "",
        message: "",
    });

    const participantsQuery = useSeasonParticipants(
        participantsSeason?.id ?? 0
    );
    const logsQuery = useSeasonLogs(logsSeason?.id ?? 0);

    const seasonStatusCounts = useMemo(() => {
        return seasons.reduce(
            (acc, season) => {
                const status = getSeasonStatus(season);
                acc[status] += 1;
                return acc;
            },
            {
                ACTIVE: 0,
                PAUSED: 0,
                INACTIVE: 0,
            } as Record<SeasonStatus, number>
        );
    }, [seasons]);

    const summaryCards = useMemo<SummaryCard[]>(() => {
        const latestCreatedAt = seasons.reduce<string | null>(
            (latest, season) => {
                if (!latest) {
                    return season.createdAt;
                }

                return new Date(season.createdAt) > new Date(latest)
                    ? season.createdAt
                    : latest;
            },
            null
        );

        return [
            {
                key: "total",
                label: "전체 시즌",
                value: seasons.length.toLocaleString("ko-KR"),
                helper:
                    seasons.length > 0
                        ? `최근 업데이트 ${formatRelativeDate(
                              latestCreatedAt ?? undefined
                          )}`
                        : "시즌이 아직 없습니다",
                icon: CalendarClockIcon,
                iconClassName: "text-sky-500",
            },
            {
                key: "active",
                label: "진행중",
                value: seasonStatusCounts.ACTIVE.toLocaleString("ko-KR"),
                helper:
                    seasonStatusCounts.ACTIVE > 0
                        ? "참여 가능한 시즌"
                        : "진행중 시즌이 없습니다",
                icon: PlayCircleIcon,
                iconClassName: "text-emerald-500",
            },
            {
                key: "paused",
                label: "일시중지",
                value: seasonStatusCounts.PAUSED.toLocaleString("ko-KR"),
                helper:
                    seasonStatusCounts.PAUSED > 0
                        ? "재개 대기 중"
                        : "일시중지 없음",
                icon: PauseCircleIcon,
                iconClassName: "text-amber-500",
            },
            {
                key: "inactive",
                label: "종료",
                value: seasonStatusCounts.INACTIVE.toLocaleString("ko-KR"),
                helper:
                    seasonStatusCounts.INACTIVE > 0
                        ? "기록 확인 가능"
                        : "종료된 시즌 없음",
                icon: HistoryIcon,
                iconClassName: "text-muted-foreground",
            },
        ];
    }, [seasonStatusCounts, seasons]);

    const filteredSeasons = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return seasons.filter((season) => {
            const matchesKeyword = keyword
                ? season.seasonName?.toLowerCase().includes(keyword)
                : true;
            const matchesStatus =
                statusFilter === "all"
                    ? true
                    : getSeasonStatus(season) === statusFilter;

            return matchesKeyword && matchesStatus;
        });
    }, [seasons, searchTerm, statusFilter]);

    const sortedSeasons = useMemo(() => {
        const sorted = [...filteredSeasons];

        sorted.sort((a, b) => {
            switch (sortState.field) {
                case "status": {
                    const statusA = getSeasonStatus(a);
                    const statusB = getSeasonStatus(b);
                    return compareValues(
                        STATUS_ORDER[statusA],
                        STATUS_ORDER[statusB],
                        sortState.direction
                    );
                }
                case "seasonName": {
                    return compareValues(
                        a.seasonName,
                        b.seasonName,
                        sortState.direction
                    );
                }
                case "startDateTime":
                case "endDateTime":
                case "createdAt": {
                    return compareValues(
                        a[sortState.field],
                        b[sortState.field],
                        sortState.direction
                    );
                }
                default:
                    return 0;
            }
        });

        return sorted;
    }, [filteredSeasons, sortState]);

    const totalItems = sortedSeasons.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(page, totalPages);
    const pageStartIndex = (safePage - 1) * pageSize;
    const currentSeasons = useMemo(
        () => sortedSeasons.slice(pageStartIndex, pageStartIndex + pageSize),
        [pageSize, pageStartIndex, sortedSeasons]
    );

    const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "all";

    useEffect(() => {
        setPage(1);
    }, [searchTerm, statusFilter, pageSize]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const createSeasonMutation = useMutation({
        mutationFn: createSeason,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seasons"] });
            setCreateSeasonDialogOpen(false);
            setNewSeason({ seasonName: "", startDate: "", endDate: "" });
        },
        onError: (error: unknown) => {
            const message = extractErrorMessage(
                error,
                "시즌 생성 중 오류가 발생했습니다."
            );
            setErrorDialog({
                open: true,
                title: "시즌 생성 실패",
                message,
            });
        },
    });

    const pauseSeasonMutation = useMutation({
        mutationFn: pauseSeason,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seasons"] });
        },
        onError: (error: unknown) => {
            const message = extractErrorMessage(
                error,
                "시즌 일시중지 중 오류가 발생했습니다."
            );
            setErrorDialog({
                open: true,
                title: "시즌 일시중지 실패",
                message,
            });
        },
    });

    const resumeSeasonMutation = useMutation({
        mutationFn: resumeSeason,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seasons"] });
        },
        onError: (error: unknown) => {
            const message = extractErrorMessage(
                error,
                "시즌 재개 중 오류가 발생했습니다."
            );
            setErrorDialog({
                open: true,
                title: "시즌 재개 실패",
                message,
            });
        },
    });

    const isTogglingSeason =
        pauseSeasonMutation.isPending || resumeSeasonMutation.isPending;

    const handleSortChange = (field: SortField) => {
        setSortState((prev) =>
            prev.field === field
                ? {
                      field,
                      direction: prev.direction === "asc" ? "desc" : "asc",
                  }
                : {
                      field,
                      direction: field === "seasonName" ? "asc" : "desc",
                  }
        );
    };

    const handleLogSortChange = (field: LogSortField) => {
        setLogSortState((prev) =>
            prev.field === field
                ? {
                      field,
                      direction: prev.direction === "asc" ? "desc" : "asc",
                  }
                : { field, direction: field === "memberEmail" ? "asc" : "desc" }
        );
    };

    const handleCreateSeason = () => {
        if (!newSeason.seasonName.trim()) {
            setErrorDialog({
                open: true,
                title: "입력 오류",
                message: "시즌 이름을 입력해주세요.",
            });
            return;
        }

        if (!newSeason.startDate || !newSeason.endDate) {
            setErrorDialog({
                open: true,
                title: "입력 오류",
                message: "시작 날짜와 종료 날짜를 모두 선택해주세요.",
            });
            return;
        }

        if (newSeason.startDate > newSeason.endDate) {
            setErrorDialog({
                open: true,
                title: "입력 오류",
                message: "시작 날짜가 종료 날짜보다 늦을 수 없습니다.",
            });
            return;
        }

        createSeasonMutation.mutate({
            seasonName: newSeason.seasonName.trim(),
            startDateTime: `${newSeason.startDate}T00:00:00`,
            endDateTime: `${newSeason.endDate}T00:00:00`,
        });
    };

    const handleToggleSeason = (season: Season) => {
        if (season.paused) {
            resumeSeasonMutation.mutate({ id: season.id });
        } else {
            pauseSeasonMutation.mutate({ id: season.id });
        }
    };

    const resetFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setSortState(DEFAULT_SORT);
    };

    const closeParticipantsDialog = () => {
        setParticipantsSeason(null);
    };

    const closeLogsDialog = () => {
        setLogsSeason(null);
        setLogSortState(DEFAULT_LOG_SORT);
    };

    const sortedLogs = useMemo(() => {
        const logs = logsQuery.data?.data.content ?? [];
        const sorted = [...logs];

        sorted.sort((a, b) => {
            switch (logSortState.field) {
                case "gameId":
                case "winningStreak": {
                    return compareValues(
                        a[logSortState.field],
                        b[logSortState.field],
                        logSortState.direction
                    );
                }
                case "memberEmail": {
                    return compareValues(
                        a.memberEmail,
                        b.memberEmail,
                        logSortState.direction
                    );
                }
                case "active": {
                    return compareValues(
                        a.active ? 1 : 0,
                        b.active ? 1 : 0,
                        logSortState.direction
                    );
                }
                case "createdAt":
                default: {
                    return compareValues(
                        a.createdAt,
                        b.createdAt,
                        logSortState.direction
                    );
                }
            }
        });

        return sorted;
    }, [logSortState, logsQuery.data?.data.content]);

    if (isSeasonsLoading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-8 p-10">
            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        시즌 관리
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        시즌 상태를 모니터링하고 참여자, 로그를 확인하세요.
                    </p>
                </div>
                <Dialog
                    open={createSeasonDialogOpen}
                    onOpenChange={(open) => {
                        setCreateSeasonDialogOpen(open);
                        if (!open) {
                            setNewSeason({
                                seasonName: "",
                                startDate: "",
                                endDate: "",
                            });
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button size="lg">
                            <Plus className="mr-2 h-4 w-4" /> 시즌 생성
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>새 시즌 생성</DialogTitle>
                            <DialogDescription>
                                시즌 기간과 이름을 입력해 새 시즌을 시작하세요.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    시즌 이름
                                </label>
                                <Input
                                    placeholder="시즌 이름을 입력하세요"
                                    value={newSeason.seasonName}
                                    onChange={(event) =>
                                        setNewSeason((prev) => ({
                                            ...prev,
                                            seasonName: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        시작 날짜
                                    </label>
                                    <Input
                                        type="date"
                                        value={newSeason.startDate}
                                        onChange={(event) =>
                                            setNewSeason((prev) => ({
                                                ...prev,
                                                startDate: event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        종료 날짜
                                    </label>
                                    <Input
                                        type="date"
                                        value={newSeason.endDate}
                                        onChange={(event) =>
                                            setNewSeason((prev) => ({
                                                ...prev,
                                                endDate: event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCreateSeasonDialogOpen(false)}
                            >
                                취소
                            </Button>
                            <Button
                                type="button"
                                onClick={handleCreateSeason}
                                disabled={createSeasonMutation.isPending}
                            >
                                {createSeasonMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        생성 중...
                                    </>
                                ) : (
                                    "생성"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </header>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => (
                    <Card key={card.key}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {card.label}
                            </CardTitle>
                            <card.icon
                                className={cn(
                                    "h-5 w-5 text-muted-foreground",
                                    card.iconClassName
                                )}
                            />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">
                                {card.value}
                            </div>
                            {card.helper ? (
                                <p className="text-xs text-muted-foreground">
                                    {card.helper}
                                </p>
                            ) : null}
                        </CardContent>
                    </Card>
                ))}
            </section>

            <Card>
                <CardHeader className="space-y-6">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>시즌 목록</CardTitle>
                            <CardDescription>
                                총 {totalItems.toLocaleString("ko-KR")}개의
                                시즌이 있습니다.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            {isSeasonsFetching ? (
                                <Badge
                                    variant="secondary"
                                    className="flex items-center gap-1"
                                >
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    새로고침 중
                                </Badge>
                            ) : null}
                            <Select
                                value={String(pageSize)}
                                onValueChange={(value) => {
                                    setPageSize(Number(value));
                                }}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="페이지 크기" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAGE_SIZE_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option}
                                            value={String(option)}
                                        >
                                            페이지당 {option}개
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row md:items-end">
                        <div className="md:w-80">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="시즌 이름 검색"
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={(value) =>
                                setStatusFilter(
                                    value === "all"
                                        ? "all"
                                        : (value as SeasonStatus)
                                )
                            }
                        >
                            <SelectTrigger className="md:w-44">
                                <SelectValue placeholder="상태 필터" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">전체 상태</SelectItem>
                                <SelectItem value="ACTIVE">진행중</SelectItem>
                                <SelectItem value="PAUSED">일시중지</SelectItem>
                                <SelectItem value="INACTIVE">종료</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetFilters}
                            disabled={!hasActiveFilters}
                        >
                            필터 초기화
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <SortableHeader
                                        label="상태"
                                        field="status"
                                        sortState={sortState}
                                        onSortChange={handleSortChange}
                                        className="w-[140px]"
                                    />
                                    <SortableHeader
                                        label="시즌 이름"
                                        field="seasonName"
                                        sortState={sortState}
                                        onSortChange={handleSortChange}
                                    />
                                    <SortableHeader
                                        label="시작"
                                        field="startDateTime"
                                        sortState={sortState}
                                        onSortChange={handleSortChange}
                                    />
                                    <SortableHeader
                                        label="종료"
                                        field="endDateTime"
                                        sortState={sortState}
                                        onSortChange={handleSortChange}
                                    />
                                    <SortableHeader
                                        label="생성일"
                                        field="createdAt"
                                        sortState={sortState}
                                        onSortChange={handleSortChange}
                                    />
                                    <TableHead className="w-[72px] text-right">
                                        관리
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentSeasons.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            {hasActiveFilters
                                                ? "조건에 맞는 시즌이 없습니다."
                                                : "등록된 시즌이 없습니다."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentSeasons.map((season) => {
                                        const status = getSeasonStatus(season);
                                        const badgeStyle =
                                            STATUS_BADGE_STYLES[status];

                                        return (
                                            <TableRow
                                                key={season.id}
                                                className="hover:bg-muted/40"
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant={
                                                                badgeStyle.variant
                                                            }
                                                            className={
                                                                badgeStyle.className
                                                            }
                                                        >
                                                            {
                                                                STATUS_LABELS[
                                                                    status
                                                                ]
                                                            }
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {season.paused
                                                                ? "재개 대기"
                                                                : season.active
                                                                ? "모집 중"
                                                                : "종료됨"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {season.seasonName}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDateTime(
                                                        season.startDateTime
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDateTime(
                                                        season.endDateTime
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDateTime(
                                                        season.createdAt,
                                                        { withTime: true }
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>
                                                                시즌 관리
                                                            </DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            {season.active ? (
                                                                <DropdownMenuItem
                                                                    onSelect={() =>
                                                                        handleToggleSeason(
                                                                            season
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isTogglingSeason
                                                                    }
                                                                >
                                                                    {season.paused ? (
                                                                        <>
                                                                            <PlayCircleIcon className="mr-2 h-4 w-4" />
                                                                            재개
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <PauseCircleIcon className="mr-2 h-4 w-4" />
                                                                            일시중지
                                                                        </>
                                                                    )}
                                                                </DropdownMenuItem>
                                                            ) : null}
                                                            <DropdownMenuItem
                                                                onSelect={() =>
                                                                    setParticipantsSeason(
                                                                        season
                                                                    )
                                                                }
                                                            >
                                                                <UsersRoundIcon className="mr-2 h-4 w-4" />
                                                                참여자 목록
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onSelect={() => {
                                                                    setLogsSeason(
                                                                        season
                                                                    );
                                                                    setLogSortState(
                                                                        DEFAULT_LOG_SORT
                                                                    );
                                                                }}
                                                            >
                                                                <ListTreeIcon className="mr-2 h-4 w-4" />
                                                                게임 로그
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="text-sm text-muted-foreground">
                            {totalItems > 0
                                ? `${(pageStartIndex + 1).toLocaleString(
                                      "ko-KR"
                                  )} - ${Math.min(
                                      pageStartIndex + pageSize,
                                      totalItems
                                  ).toLocaleString(
                                      "ko-KR"
                                  )} / ${totalItems.toLocaleString("ko-KR")}개`
                                : "표시할 시즌이 없습니다."}
                        </div>
                        <PaginationControls
                            currentPage={safePage}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={participantsSeason !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        closeParticipantsDialog();
                    }
                }}
            >
                <DialogContent className="max-w-4xl">
                    {participantsSeason ? (
                        <ParticipantsDialogHeader season={participantsSeason} />
                    ) : null}
                    <div className="max-h-[480px] overflow-y-auto rounded-lg border">
                        {participantsQuery.isLoading ? (
                            <LoadingTable />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>이름</TableHead>
                                        <TableHead>닉네임</TableHead>
                                        <TableHead>이메일</TableHead>
                                        <TableHead>권한</TableHead>
                                        <TableHead>참여일</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {participantsQuery.data?.data.content
                                        ?.length ? (
                                        participantsQuery.data.data.content.map(
                                            (participant) => (
                                                <TableRow key={participant.id}>
                                                    <TableCell>
                                                        {participant.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {participant.nickname}
                                                    </TableCell>
                                                    <TableCell>
                                                        {participant.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="secondary"
                                                            className={cn(
                                                                "border-transparent text-xs font-medium",
                                                                ROLE_BADGE[
                                                                    participant
                                                                        .role
                                                                ]
                                                            )}
                                                        >
                                                            {participant.role ===
                                                            "ADMIN"
                                                                ? "관리자"
                                                                : "사용자"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDateTime(
                                                            participant.createdAt,
                                                            { withTime: true }
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-32 text-center text-muted-foreground"
                                            >
                                                참여자가 없습니다.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={logsSeason !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        closeLogsDialog();
                    }
                }}
            >
                <DialogContent className="max-w-4xl">
                    {logsSeason ? (
                        <ParticipantsDialogHeader
                            season={logsSeason}
                            title="시즌 게임 로그"
                            description="진행된 게임 기록을 확인할 수 있습니다."
                        />
                    ) : null}
                    <div className="max-h-[480px] overflow-y-auto rounded-lg border">
                        {logsQuery.isLoading ? (
                            <LoadingTable />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <SortableHeader
                                            label="게임 ID"
                                            field="gameId"
                                            sortState={logSortState}
                                            onSortChange={handleLogSortChange}
                                        />
                                        <SortableHeader
                                            label="플레이어 이메일"
                                            field="memberEmail"
                                            sortState={logSortState}
                                            onSortChange={handleLogSortChange}
                                        />
                                        <SortableHeader
                                            label="연승"
                                            field="winningStreak"
                                            sortState={logSortState}
                                            onSortChange={handleLogSortChange}
                                        />
                                        <SortableHeader
                                            label="진행 시간"
                                            field="createdAt"
                                            sortState={logSortState}
                                            onSortChange={handleLogSortChange}
                                        />
                                        <SortableHeader
                                            label="상태"
                                            field="active"
                                            sortState={logSortState}
                                            onSortChange={handleLogSortChange}
                                        />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedLogs.length ? (
                                        sortedLogs.map((log) => (
                                            <TableRow
                                                key={`${log.gameId}-${log.createdAt}`}
                                            >
                                                <TableCell>
                                                    {log.gameId}
                                                </TableCell>
                                                <TableCell>
                                                    {log.memberEmail}
                                                </TableCell>
                                                <TableCell>
                                                    {log.winningStreak}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDateTime(
                                                        log.createdAt,
                                                        {
                                                            withTime: true,
                                                        }
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            log.active
                                                                ? "secondary"
                                                                : "outline"
                                                        }
                                                        className={cn(
                                                            log.active
                                                                ? "border-transparent bg-emerald-500/10 text-emerald-600"
                                                                : "border-dashed text-muted-foreground"
                                                        )}
                                                    >
                                                        {log.active
                                                            ? "진행중"
                                                            : "완료"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-32 text-center text-muted-foreground"
                                            >
                                                로그 데이터가 없습니다.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog
                open={errorDialog.open}
                onOpenChange={(open) =>
                    setErrorDialog((prev) => ({ ...prev, open }))
                }
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{errorDialog.title}</DialogTitle>
                        <DialogDescription>
                            {errorDialog.message}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() =>
                                setErrorDialog((prev) => ({
                                    ...prev,
                                    open: false,
                                }))
                            }
                        >
                            확인
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

type SortableHeaderProps<TField extends string> = {
    label: string;
    field: TField;
    sortState: { field: TField; direction: SortDirection };
    onSortChange: (field: TField) => void;
    className?: string;
};

function SortableHeader<TField extends string>({
    label,
    field,
    sortState,
    onSortChange,
    className,
}: SortableHeaderProps<TField>) {
    const isActive = sortState.field === field;
    const DirectionIcon = isActive
        ? sortState.direction === "asc"
            ? ArrowUp
            : ArrowDown
        : ArrowUpDown;

    return (
        <TableHead className={cn("whitespace-nowrap", className)}>
            <button
                type="button"
                className="flex w-full items-center justify-between gap-2 text-left font-medium transition-colors hover:text-foreground"
                onClick={() => onSortChange(field)}
            >
                <span>{label}</span>
                <DirectionIcon
                    className={cn(
                        "h-4 w-4",
                        isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                    aria-hidden
                />
            </button>
        </TableHead>
    );
}

type PaginationControlsProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

function PaginationControls({
    currentPage,
    totalPages,
    onPageChange,
}: PaginationControlsProps) {
    if (totalPages <= 1) {
        return null;
    }

    const pages = createPageNumbers(currentPage, totalPages);

    return (
        <div className="flex items-center justify-end gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
            >
                이전
            </Button>
            {pages.map((page) => (
                <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </Button>
            ))}
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    onPageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
            >
                다음
            </Button>
        </div>
    );
}

function createPageNumbers(currentPage: number, totalPages: number) {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
        return [1, 2, 3, 4, 5];
    }

    if (currentPage >= totalPages - 2) {
        return [
            totalPages - 4,
            totalPages - 3,
            totalPages - 2,
            totalPages - 1,
            totalPages,
        ];
    }

    return [
        currentPage - 2,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        currentPage + 2,
    ];
}

function ParticipantsDialogHeader({
    season,
    title = "시즌 참여자 목록",
    description = "현재 시즌에 참여하고 있는 사용자 목록입니다.",
}: {
    season: Season;
    title?: string;
    description?: string;
}) {
    const status = getSeasonStatus(season);

    return (
        <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl">
                {title}
                <span className="ml-2 text-base font-normal text-muted-foreground">
                    {season.seasonName}
                </span>
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge
                    variant={STATUS_BADGE_STYLES[status].variant}
                    className={STATUS_BADGE_STYLES[status].className}
                >
                    {STATUS_LABELS[status]}
                </Badge>
                <span>
                    {formatDateTime(season.startDateTime)} ~{" "}
                    {formatDateTime(season.endDateTime)}
                </span>
            </div>
        </DialogHeader>
    );
}

function LoadingTable() {
    return (
        <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
            ))}
        </div>
    );
}

function compareValues(
    a: string | number | undefined,
    b: string | number | undefined,
    direction: SortDirection
) {
    if (typeof a === "string" || typeof b === "string") {
        const dateA = toDate(a);
        const dateB = toDate(b);

        if (dateA !== null && dateB !== null) {
            return direction === "asc" ? dateA - dateB : dateB - dateA;
        }

        const strA = (a ?? "").toString().toLowerCase();
        const strB = (b ?? "").toString().toLowerCase();

        if (strA < strB) return direction === "asc" ? -1 : 1;
        if (strA > strB) return direction === "asc" ? 1 : -1;
        return 0;
    }

    const numA = typeof a === "number" ? a : 0;
    const numB = typeof b === "number" ? b : 0;

    return direction === "asc" ? numA - numB : numB - numA;
}

function toDate(value: string | number | undefined) {
    if (typeof value !== "string") {
        return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.getTime();
}

function getSeasonStatus(season: Season): SeasonStatus {
    if (!season.active) {
        return "INACTIVE";
    }

    if (season.paused) {
        return "PAUSED";
    }

    return "ACTIVE";
}

function extractErrorMessage(error: unknown, fallback: string) {
    if (
        isAxiosError<DefaultResponse<unknown>>(error) &&
        error.response?.data?.message
    ) {
        return error.response.data.message;
    }

    return fallback;
}

function formatDateTime(
    value: string,
    { withTime = false }: { withTime?: boolean } = {}
) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        ...(withTime
            ? {
                  hour: "2-digit",
                  minute: "2-digit",
              }
            : {}),
    }).format(date);
}

function formatRelativeDate(value?: string) {
    if (!value) return "정보 없음";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "정보 없음";
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        return "오늘";
    }

    if (diffDays === 1) {
        return "어제";
    }

    if (diffDays < 7) {
        return `${diffDays}일 전`;
    }

    return formatDateTime(value);
}
