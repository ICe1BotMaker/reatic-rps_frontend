"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationResult,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { LucideIcon } from "lucide-react";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    CalendarClockIcon,
    Download,
    Filter,
    HistoryIcon,
    MoreVertical,
    Search,
    ShieldCheckIcon,
    ShieldMinusIcon,
    ShieldPlusIcon,
    UserCheckIcon,
    UserIcon,
    UserXIcon,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DefaultResponse } from "@/api/types";
import type { GetMembersResponse } from "@/features/admin/user/types";
import { useMembers } from "@/features/admin/user/hooks";
import {
    banMember,
    demoteMember,
    getMemberLoginLogs,
    promoteMember,
    unbanMember,
} from "@/features/admin/user/api";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const DEFAULT_SORT: SortState = { field: "createdAt", direction: "desc" };

type Member = GetMembersResponse["content"][number];
type MemberStatus = Member["status"];
type MemberRole = Member["role"];

type SortField =
    | "status"
    | "name"
    | "nickname"
    | "phoneNumber"
    | "email"
    | "role"
    | "createdAt"
    | "latestSeasonBestStreak"
    | "latestSeasonRank";

type SortState = {
    field: SortField;
    direction: "asc" | "desc";
};

type ErrorDialogState = {
    open: boolean;
    title: string;
    message: string;
};

type MutationWithErrorHandling = UseMutationResult<
    unknown,
    AxiosError<DefaultResponse<unknown>>,
    { id: number }
>;

type SummaryCardData = {
    key: string;
    label: string;
    value: string;
    helper?: string;
    delta?: { text: string; tone: "positive" | "negative" | "neutral" };
    icon: LucideIcon;
    iconClassName?: string;
};

const ROLE_LABELS: Record<MemberRole, string> = {
    ADMIN: "관리자",
    MEMBER: "일반 사용자",
};

const STATUS_LABELS: Record<string, string> = {
    ACTIVE: "활성",
    BANNED: "정지",
    SUSPENDED: "보류",
};

const STATUS_BADGE_STYLES: Record<
    string,
    {
        variant?: "default" | "destructive" | "outline" | "secondary";
        className?: string;
    }
> = {
    ACTIVE: {
        variant: "secondary",
        className: "border-transparent bg-emerald-500/10 text-emerald-600",
    },
    BANNED: {
        variant: "destructive",
    },
    SUSPENDED: {
        variant: "secondary",
        className: "border-transparent bg-amber-500/10 text-amber-600",
    },
};

const ROLE_BADGE_STYLES: Record<MemberRole, string> = {
    ADMIN: "border-transparent bg-sky-500/15 text-sky-600",
    MEMBER: "border-border/60 bg-muted/60 text-muted-foreground",
};

export default function UserManagementPage() {
    const queryClient = useQueryClient();

    const {
        data: membersResponse,
        isLoading: isMembersLoading,
        isFetching: isMembersFetching,
        isError: isMembersError,
    } = useMembers();

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<MemberRole | "all">("all");
    const [statusFilter, setStatusFilter] = useState<MemberStatus | "all">(
        "all"
    );
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [sortState, setSortState] = useState<SortState>(DEFAULT_SORT);

    const [detailMemberId, setDetailMemberId] = useState<number | null>(null);
    const [loginLogTargetId, setLoginLogTargetId] = useState<number | null>(
        null
    );
    const [errorDialog, setErrorDialog] = useState<ErrorDialogState>({
        open: false,
        message: "",
        title: "",
    });

    const members = useMemo(
        () => membersResponse?.data?.content ?? [],
        [membersResponse?.data?.content]
    );

    const statusCounts = useMemo(() => {
        return members.reduce<Record<string, number>>((accumulator, member) => {
            const statusKey = member.status ?? "UNKNOWN";
            accumulator[statusKey] = (accumulator[statusKey] ?? 0) + 1;
            return accumulator;
        }, {});
    }, [members]);

    const roleCounts = useMemo(() => {
        const counts: Record<MemberRole, number> = { ADMIN: 0, MEMBER: 0 };
        members.forEach((member) => {
            counts[member.role] += 1;
        });
        return counts;
    }, [members]);

    const recentSignupStats = useMemo(() => {
        const now = Date.now();
        const day = 1000 * 60 * 60 * 24;
        const recentWindowStart = now - 30 * day;
        const previousWindowStart = now - 60 * day;

        let recent = 0;
        let previous = 0;

        members.forEach((member) => {
            const createdAt = new Date(member.createdAt).getTime();
            if (Number.isNaN(createdAt)) {
                return;
            }

            if (createdAt >= recentWindowStart) {
                recent += 1;
                return;
            }

            if (
                createdAt >= previousWindowStart &&
                createdAt < recentWindowStart
            ) {
                previous += 1;
            }
        });

        return { recent, previous };
    }, [members]);

    const uniqueStatuses = useMemo(() => {
        const set = new Set<MemberStatus>();
        members.forEach((member) => {
            if (member.status) {
                set.add(member.status);
            }
        });
        return Array.from(set);
    }, [members]);

    const filteredMembers = useMemo(() => {
        const normalizedTerm = searchTerm.trim().toLowerCase();

        return members.filter((member) => {
            const matchesSearch = normalizedTerm
                ? [
                      member.name,
                      member.nickname,
                      member.email,
                      member.phoneNumber,
                  ].some((value) =>
                      value?.toLowerCase().includes(normalizedTerm)
                  )
                : true;

            const matchesRole =
                roleFilter === "all" ? true : member.role === roleFilter;
            const matchesStatus =
                statusFilter === "all" ? true : member.status === statusFilter;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [members, searchTerm, roleFilter, statusFilter]);

    const sortedMembers = useMemo(() => {
        const accessor = SORT_ACCESSORS[sortState.field];
        const sorted = [...filteredMembers].sort((a, b) => {
            const aValue = accessor(a);
            const bValue = accessor(b);
            const comparison = compareValues(aValue, bValue);
            return sortState.direction === "asc" ? comparison : -comparison;
        });

        return sorted;
    }, [filteredMembers, sortState]);

    const summaryCards = useMemo<SummaryCardData[]>(() => {
        const totalMembersCount = members.length;
        const filteredCount = filteredMembers.length;
        const activeCount = statusCounts.ACTIVE ?? 0;
        const adminCount = roleCounts.ADMIN ?? 0;
        const memberCount = roleCounts.MEMBER ?? 0;
        const { recent, previous } = recentSignupStats;
        const trendDifference = recent - previous;

        let recentDelta: SummaryCardData["delta"];
        if (trendDifference === 0) {
            recentDelta =
                previous === 0 && recent === 0
                    ? { text: "최근 60일 신규 없음", tone: "neutral" }
                    : { text: "지난 30일 대비 변화 없음", tone: "neutral" };
        } else if (trendDifference > 0) {
            recentDelta = {
                text: `지난 30일 대비 +${formatNumber(trendDifference)}명`,
                tone: "positive",
            };
        } else {
            recentDelta = {
                text: `지난 30일 대비 -${formatNumber(
                    Math.abs(trendDifference)
                )}명`,
                tone: "negative",
            };
        }

        const statusHelpers = Object.entries(statusCounts)
            .filter(
                ([status]) =>
                    status !== "ACTIVE" && (statusCounts[status] ?? 0) > 0
            )
            .map(
                ([status, count]) =>
                    `${STATUS_LABELS[status] ?? status} ${formatNumber(
                        count
                    )}명`
            );

        const adminRatio =
            totalMembersCount > 0 ? adminCount / totalMembersCount : 0;

        return [
            {
                key: "total-members",
                label: "전체 사용자",
                value: formatNumber(totalMembersCount),
                helper: `필터 적용: ${formatNumber(filteredCount)}명`,
                icon: UsersRoundIcon,
                iconClassName: "bg-primary/10 text-primary",
            },
            {
                key: "active-members",
                label: "활성 사용자",
                value: formatNumber(activeCount),
                helper: statusHelpers.length
                    ? statusHelpers.join(" · ")
                    : "이상 상태 없음",
                icon: UserCheckIcon,
                iconClassName: "bg-emerald-500/10 text-emerald-600",
            },
            {
                key: "admin-members",
                label: "관리자 계정",
                value: formatNumber(adminCount),
                helper: `일반 사용자 ${formatNumber(
                    memberCount
                )}명 · 관리자 비율 ${formatPercentage(adminRatio)}`,
                icon: ShieldCheckIcon,
                iconClassName: "bg-sky-500/10 text-sky-600",
            },
            {
                key: "recent-members",
                label: "최근 30일 신규",
                value: formatNumber(recent),
                helper: `이전 30일 ${formatNumber(previous)}명`,
                delta: recentDelta,
                icon: CalendarClockIcon,
                iconClassName: "bg-amber-500/10 text-amber-600",
            },
        ];
    }, [filteredMembers, members, recentSignupStats, roleCounts, statusCounts]);

    const totalMembers = sortedMembers.length;
    const totalPages = Math.max(1, Math.ceil(totalMembers / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIndex = totalMembers === 0 ? 0 : (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageMembers = sortedMembers.slice(startIndex, endIndex);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, roleFilter, statusFilter, pageSize]);

    useEffect(() => {
        if (currentPage !== page) {
            setPage(currentPage);
        }
    }, [currentPage, page]);

    const detailMember = useMemo(() => {
        if (!detailMemberId) return null;
        return members.find((member) => member.id === detailMemberId) ?? null;
    }, [detailMemberId, members]);

    const loginLogTarget = useMemo(() => {
        if (!loginLogTargetId) return null;
        return members.find((member) => member.id === loginLogTargetId) ?? null;
    }, [loginLogTargetId, members]);

    const banMutation = useInvalidateMembersMutation(banMember, queryClient);
    const unbanMutation = useInvalidateMembersMutation(
        unbanMember,
        queryClient
    );
    const promoteMutation = useInvalidateMembersMutation(
        promoteMember,
        queryClient,
        (error) =>
            setErrorDialog({
                open: true,
                title: "승격 실패",
                message:
                    error.response?.data?.message ||
                    "승격 중 오류가 발생했습니다.",
            })
    );
    const demoteMutation = useInvalidateMembersMutation(
        demoteMember,
        queryClient,
        (error) =>
            setErrorDialog({
                open: true,
                title: "강등 실패",
                message:
                    error.response?.data?.message ||
                    "강등 중 오류가 발생했습니다.",
            })
    );

    const loginLogsDialogQuery = useMemberLoginLogs(loginLogTargetId);
    const detailLoginLogsQuery = useMemberLoginLogs(detailMemberId);

    const isAnyActionPending =
        banMutation.isPending ||
        unbanMutation.isPending ||
        promoteMutation.isPending ||
        demoteMutation.isPending;

    const handleSortChange = (field: SortField) => {
        setSortState((prev) => {
            if (prev.field !== field) {
                return { field, direction: "asc" };
            }
            const nextDirection = prev.direction === "asc" ? "desc" : "asc";
            return { field, direction: nextDirection };
        });
    };

    const handleBanToggle = (member: Member) => {
        if (member.status === "ACTIVE") {
            banMutation.mutate({ id: member.id });
        } else {
            unbanMutation.mutate({ id: member.id });
        }
    };

    const handleRoleToggle = (member: Member) => {
        if (member.role === "MEMBER") {
            promoteMutation.mutate({ id: member.id });
        } else {
            demoteMutation.mutate({ id: member.id });
        }
    };

    const handleExport = () => {
        if (members.length === 0) return;

        const header = [
            "ID",
            "이름",
            "닉네임",
            "이메일",
            "전화번호",
            "권한",
            "상태",
            "가입일",
            "최대 우승",
            "최신 시즌 순위",
        ];

        const rows = filteredMembers.map((member) => [
            member.id,
            member.name ?? "",
            member.nickname ?? "",
            member.email ?? "",
            member.phoneNumber ?? "",
            ROLE_LABELS[member.role] ?? member.role,
            STATUS_LABELS[member.status] ?? member.status,
            formatDate(member.createdAt),
            member.latestSeasonBestStreak ?? 0,
            member.latestSeasonRank ?? "",
        ]);

        const csvContent = [header, ...rows]
            .map((row) =>
                row
                    .map((value) =>
                        typeof value === "string"
                            ? `"${value.replace(/"/g, '""')}"`
                            : value
                    )
                    .join(",")
            )
            .join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "users.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (isMembersLoading) {
        return <PageSkeleton />;
    }

    if (isMembersError) {
        return (
            <div className="flex-1 p-[50px]">
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-destructive">
                    사용자 목록을 불러오는 중 오류가 발생했습니다.
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1">
            <div className="space-y-6 p-[50px]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">사용자 관리</h1>
                        <p className="text-sm text-muted-foreground">
                            총 {members.length}명 중 {filteredMembers.length}
                            명이 표시됩니다.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            disabled={filteredMembers.length === 0}
                        >
                            <Download className="mr-2 h-4 w-4" /> CSV 내보내기
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSearchTerm("");
                                setRoleFilter("all");
                                setStatusFilter("all");
                                setSortState(DEFAULT_SORT);
                                setPageSize(DEFAULT_PAGE_SIZE);
                            }}
                            disabled={
                                !searchTerm &&
                                roleFilter === "all" &&
                                statusFilter === "all" &&
                                sortState.field === DEFAULT_SORT.field &&
                                sortState.direction ===
                                    DEFAULT_SORT.direction &&
                                pageSize === DEFAULT_PAGE_SIZE
                            }
                        >
                            초기화
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <SummaryStatCard
                            key={card.key}
                            data={card}
                            isRefreshing={isMembersFetching}
                        />
                    ))}
                </div>

                <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Filter className="h-4 w-4" />
                        필터 & 검색
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="이름, 닉네임, 이메일, 전화번호 검색"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                className="pl-9"
                            />
                        </div>
                        <div>
                            <Select
                                value={roleFilter}
                                onValueChange={(value) =>
                                    setRoleFilter(value as MemberRole | "all")
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="권한 전체" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        권한 전체
                                    </SelectItem>
                                    <SelectItem value="ADMIN">
                                        관리자
                                    </SelectItem>
                                    <SelectItem value="MEMBER">
                                        일반 사용자
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) =>
                                    setStatusFilter(
                                        value as MemberStatus | "all"
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="상태 전체" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        상태 전체
                                    </SelectItem>
                                    {uniqueStatuses.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {STATUS_LABELS[status] ?? status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Select
                                value={String(pageSize)}
                                onValueChange={(value) =>
                                    setPageSize(Number(value))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="페이지 크기" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAGE_SIZE_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option}
                                            value={String(option)}
                                        >
                                            페이지 당 {option}명
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {isMembersFetching && (
                        <p className="text-xs text-muted-foreground">
                            최신 데이터를 불러오는 중입니다...
                        </p>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[960px] text-sm">
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <SortedHeader
                                        label="사용자"
                                        field="name"
                                        sortState={sortState}
                                        onSortChange={handleSortChange}
                                        className="min-w-[240px]"
                                    />
                                    <SortedHeader
                                        label="상태"
                                        field="status"
                                        sortState={sortState}
                                        onSortChange={handleSortChange}
                                        className="w-[140px]"
                                    />
                                    <SortedHeader
                                        label="연락처"
                                        field="phoneNumber"
                                        sortState={sortState}
                                        onSortChange={handleSortChange}
                                        className="min-w-[160px]"
                                    />
                                    <SortedHeader
                                        label="게임 지표"
                                        field="latestSeasonBestStreak"
                                        sortState={sortState}
                                        onSortChange={handleSortChange}
                                        className="min-w-[160px]"
                                    />
                                    <SortedHeader
                                        label="가입일"
                                        field="createdAt"
                                        sortState={sortState}
                                        onSortChange={handleSortChange}
                                        className="min-w-[160px]"
                                    />
                                    <TableHead className="w-[220px] text-right">
                                        관리
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pageMembers.map((member) => {
                                    const displayName =
                                        member.name ||
                                        member.nickname ||
                                        `사용자 #${member.id}`;
                                    const nicknameLabel = member.nickname
                                        ? `@${member.nickname}`
                                        : null;
                                    const streakLabel =
                                        member.latestSeasonBestStreak
                                            ? `${member.latestSeasonBestStreak}연승`
                                            : "-";
                                    const rankLabel = member.latestSeasonRank
                                        ? `${member.latestSeasonRank}위`
                                        : "순위 정보 없음";
                                    const relativeJoinedAt = formatRelativeTime(
                                        member.createdAt
                                    );

                                    return (
                                        <TableRow
                                            key={member.id}
                                            className="cursor-pointer bg-white hover:bg-muted/30"
                                            onClick={() =>
                                                setDetailMemberId(member.id)
                                            }
                                        >
                                            <TableCell className="min-w-[240px] py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative h-12 w-12 overflow-hidden rounded-full border border-border/60 bg-muted">
                                                        {member.profileImageUrl ? (
                                                            <Image
                                                                src={
                                                                    member.profileImageUrl
                                                                }
                                                                alt={
                                                                    displayName
                                                                }
                                                                fill
                                                                sizes="48px"
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                                                {createAvatarInitial(
                                                                    displayName
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-semibold leading-none">
                                                                {displayName}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                #{member.id}
                                                            </span>
                                                        </div>
                                                        {nicknameLabel ? (
                                                            <p className="text-xs text-muted-foreground">
                                                                {nicknameLabel}
                                                            </p>
                                                        ) : null}
                                                        <p className="text-xs text-muted-foreground">
                                                            {member.email ||
                                                                "-"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="w-[140px] py-4 align-top">
                                                <div className="flex flex-col gap-2">
                                                    <StatusBadge
                                                        status={member.status}
                                                    />
                                                    <MemberRoleBadge
                                                        role={member.role}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="min-w-[160px] py-4 align-top">
                                                <div className="space-y-1">
                                                    <span className="font-medium">
                                                        {member.phoneNumber ||
                                                            "-"}
                                                    </span>
                                                    <br />
                                                    <span className="text-xs text-muted-foreground">
                                                        {member.email
                                                            ? "이메일 확인 완료"
                                                            : "연락처 정보 부족"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="min-w-[160px] py-4 align-top">
                                                <div className="space-y-1">
                                                    <span className="font-medium">
                                                        {streakLabel}
                                                    </span>
                                                    <br />
                                                    <span className="text-xs text-muted-foreground">
                                                        {rankLabel}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="min-w-[160px] py-4 align-top">
                                                <div className="space-y-1">
                                                    <span className="font-medium">
                                                        {formatDate(
                                                            member.createdAt
                                                        )}
                                                    </span>
                                                    <br />
                                                    <span className="text-xs text-muted-foreground">
                                                        {relativeJoinedAt}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell
                                                className="w-[220px] py-4"
                                                onClick={(event) =>
                                                    event.stopPropagation()
                                                }
                                            >
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="float-right"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>
                                                            사용자 #{member.id}{" "}
                                                            관리
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onSelect={() =>
                                                                setDetailMemberId(
                                                                    member.id
                                                                )
                                                            }
                                                        >
                                                            <UserIcon className="mr-2 h-4 w-4" />
                                                            사용자 정보
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onSelect={() =>
                                                                setLoginLogTargetId(
                                                                    member.id
                                                                )
                                                            }
                                                        >
                                                            <HistoryIcon className="mr-2 h-4 w-4" />
                                                            로그인 로그
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onSelect={() =>
                                                                handleRoleToggle(
                                                                    member
                                                                )
                                                            }
                                                            disabled={
                                                                isAnyActionPending
                                                            }
                                                        >
                                                            {member.role ===
                                                            "MEMBER" ? (
                                                                <>
                                                                    <ShieldPlusIcon className="mr-2 h-4 w-4" />
                                                                    관리자 승격
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ShieldMinusIcon className="mr-2 h-4 w-4" />
                                                                    관리자 강등
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onSelect={() =>
                                                                handleBanToggle(
                                                                    member
                                                                )
                                                            }
                                                            disabled={
                                                                isAnyActionPending
                                                            }
                                                        >
                                                            {member.status ===
                                                            "ACTIVE" ? (
                                                                <>
                                                                    <UserXIcon className="mr-2 h-4 w-4" />
                                                                    정지
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserCheckIcon className="mr-2 h-4 w-4" />
                                                                    정지 해제
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {pageMembers.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            {members.length === 0
                                                ? "등록된 사용자가 없습니다."
                                                : "검색 조건에 맞는 사용자가 없습니다."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {totalMembers > 0 && (
                    <div className="flex flex-col gap-2 rounded-lg border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-muted-foreground">
                            {totalMembers === 0
                                ? "표시할 데이터가 없습니다."
                                : `${startIndex + 1} - ${Math.min(
                                      endIndex,
                                      totalMembers
                                  )} / ${totalMembers}`}
                        </div>
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>

            <LoginLogsDialog
                member={loginLogTarget}
                query={loginLogsDialogQuery}
                onOpenChange={(open) => {
                    if (!open) {
                        setLoginLogTargetId(null);
                    }
                }}
            />

            <UserDetailDialog
                member={detailMember}
                loginLogsQuery={detailLoginLogsQuery}
                onOpenChange={(open) => {
                    if (!open) {
                        setDetailMemberId(null);
                    }
                }}
                onBanToggle={handleBanToggle}
                onRoleToggle={handleRoleToggle}
                isActionPending={isAnyActionPending}
            />

            <Dialog
                open={errorDialog.open}
                onOpenChange={(open) =>
                    setErrorDialog((previous) => ({ ...previous, open }))
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{errorDialog.title}</DialogTitle>
                        <DialogDescription>
                            {errorDialog.message}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            onClick={() =>
                                setErrorDialog((previous) => ({
                                    ...previous,
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

function PageSkeleton() {
    return (
        <div className="flex-1 space-y-6 p-[50px]">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-[140px] w-full" />
                ))}
            </div>
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[520px] w-full" />
        </div>
    );
}

function SummaryStatCard({
    data,
    isRefreshing,
}: {
    data: SummaryCardData;
    isRefreshing: boolean;
}) {
    const { icon: Icon, label, value, helper, delta, iconClassName } = data;

    return (
        <Card className="relative overflow-hidden border-border/60 transition-shadow hover:shadow-md">
            {isRefreshing && (
                <span className="absolute right-4 top-4 h-2 w-2 animate-ping rounded-full bg-primary/70" />
            )}
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {label}
                </CardTitle>
                <div
                    className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground",
                        iconClassName
                    )}
                >
                    <Icon className="h-4 w-4" aria-hidden />
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="text-2xl font-semibold tracking-tight">
                    {value}
                </div>
                {helper ? (
                    <CardDescription className="text-xs text-muted-foreground">
                        {helper}
                    </CardDescription>
                ) : null}
                {delta ? (
                    <p
                        className={cn(
                            "text-xs font-medium",
                            delta.tone === "positive"
                                ? "text-emerald-600"
                                : delta.tone === "negative"
                                ? "text-destructive"
                                : "text-muted-foreground"
                        )}
                    >
                        {delta.text}
                    </p>
                ) : null}
            </CardContent>
        </Card>
    );
}

function SortedHeader({
    label,
    field,
    sortState,
    onSortChange,
    className,
}: {
    label: string;
    field: SortField;
    sortState: SortState;
    onSortChange: (field: SortField) => void;
    className?: string;
}) {
    const isActive = sortState.field === field;
    const DirectionIcon = isActive
        ? sortState.direction === "asc"
            ? ArrowUp
            : ArrowDown
        : ArrowUpDown;

    return (
        <TableHead className={className}>
            <button
                type="button"
                className="flex w-full items-center justify-between gap-2 text-left font-medium transition-colors hover:text-foreground"
                onClick={() => onSortChange(field)}
            >
                <span>{label}</span>
                <span
                    className={cn(
                        "flex items-center text-xs",
                        isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                >
                    <DirectionIcon className="h-4 w-4" aria-hidden />
                    <span className="sr-only">
                        {isActive
                            ? sortState.direction === "asc"
                                ? "오름차순으로 정렬됨"
                                : "내림차순으로 정렬됨"
                            : "정렬 기준 변경"}
                    </span>
                </span>
            </button>
        </TableHead>
    );
}

function PaginationControls({
    currentPage,
    totalPages,
    onPageChange,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    const createPageNumbers = () => {
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
    };

    const changePage = (page: number) => {
        const next = Math.max(1, Math.min(page, totalPages));
        onPageChange(next);
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(1)}
                disabled={currentPage === 1}
            >
                처음
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
            >
                이전
            </Button>
            {createPageNumbers().map((pageNumber) => (
                <Button
                    key={pageNumber}
                    variant={pageNumber === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => changePage(pageNumber)}
                >
                    {pageNumber}
                </Button>
            ))}
            <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                다음
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(totalPages)}
                disabled={currentPage === totalPages}
            >
                마지막
            </Button>
        </div>
    );
}

function LoginLogsDialog({
    member,
    query,
    onOpenChange,
}: {
    member: Member | null;
    query: ReturnType<typeof useMemberLoginLogs>;
    onOpenChange: (open: boolean) => void;
}) {
    const logs = query.data?.data?.content ?? [];

    return (
        <Dialog open={!!member} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        {member
                            ? `${
                                  member.name ?? member.nickname ?? "사용자"
                              } 로그인 로그`
                            : "로그인 로그"}
                    </DialogTitle>
                    <DialogDescription>
                        최근 로그인 이력을 확인할 수 있습니다.
                    </DialogDescription>
                </DialogHeader>
                {query.isLoading ? (
                    <div className="py-8 text-center text-muted-foreground">
                        로그인 로그를 불러오는 중입니다...
                    </div>
                ) : logs.length > 0 ? (
                    <div className="max-h-72 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>로그인 시간</TableHead>
                                    <TableHead>IP 주소</TableHead>
                                    <TableHead>디바이스 식별</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            {formatDateTime(log.loginAt)}
                                        </TableCell>
                                        <TableCell>{log.ipAddress}</TableCell>
                                        <TableCell className="max-w-[220px] truncate">
                                            {log.deviceFingerprint ||
                                                log.userAgent ||
                                                "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">
                        로그인 로그가 없습니다.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function UserDetailDialog({
    member,
    loginLogsQuery,
    onOpenChange,
    onBanToggle,
    onRoleToggle,
    isActionPending,
}: {
    member: Member | null;
    loginLogsQuery: ReturnType<typeof useMemberLoginLogs>;
    onOpenChange: (open: boolean) => void;
    onBanToggle: (member: Member) => void;
    onRoleToggle: (member: Member) => void;
    isActionPending: boolean;
}) {
    const logs = loginLogsQuery.data?.data?.content ?? [];

    return (
        <Dialog open={!!member} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                {member && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-4">
                                <div className="h-16 w-16 overflow-hidden rounded-full bg-muted">
                                    {member.profileImageUrl ? (
                                        <Image
                                            src={member.profileImageUrl}
                                            alt={
                                                member.name ??
                                                member.nickname ??
                                                "프로필 이미지"
                                            }
                                            width={64}
                                            height={64}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xl font-semibold">
                                            {(
                                                member.name ??
                                                member.nickname ??
                                                ""
                                            ).slice(0, 1) || "?"}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-semibold">
                                            {member.name ||
                                                member.nickname ||
                                                "사용자"}
                                        </span>
                                        <StatusBadge status={member.status} />
                                        <MemberRoleBadge role={member.role} />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        가입일 {formatDate(member.createdAt)}
                                    </p>
                                </div>
                            </DialogTitle>
                        </DialogHeader>

                        <Tabs defaultValue="profile" className="mt-4">
                            <TabsList>
                                <TabsTrigger value="profile">
                                    기본 정보
                                </TabsTrigger>
                                <TabsTrigger value="activity">활동</TabsTrigger>
                                <TabsTrigger value="logs">
                                    로그인 로그
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="profile" className="space-y-4">
                                <DetailSection title="연락처">
                                    <DetailItem
                                        label="이메일"
                                        value={member.email || "-"}
                                    />
                                    <DetailItem
                                        label="전화번호"
                                        value={member.phoneNumber || "-"}
                                    />
                                </DetailSection>
                                <DetailSection title="계정 상태">
                                    <DetailItem
                                        label="상태"
                                        value={
                                            STATUS_LABELS[member.status] ??
                                            member.status
                                        }
                                    />
                                    <DetailItem
                                        label="권한"
                                        value={
                                            ROLE_LABELS[member.role] ??
                                            member.role
                                        }
                                    />
                                    <DetailItem
                                        label="가입일"
                                        value={formatDateTime(member.createdAt)}
                                    />
                                </DetailSection>
                            </TabsContent>
                            <TabsContent value="activity" className="space-y-4">
                                <DetailSection title="게임 활동">
                                    <DetailItem
                                        label="최대 연승"
                                        value={
                                            member.latestSeasonBestStreak
                                                ? `${member.latestSeasonBestStreak}연승`
                                                : "-"
                                        }
                                    />
                                    <DetailItem
                                        label="최신 시즌 순위"
                                        value={member.latestSeasonRank || "-"}
                                    />
                                </DetailSection>
                            </TabsContent>
                            <TabsContent value="logs">
                                {loginLogsQuery.isLoading ? (
                                    <div className="py-8 text-center text-muted-foreground">
                                        로그인 로그를 불러오는 중입니다...
                                    </div>
                                ) : logs.length > 0 ? (
                                    <div className="max-h-64 overflow-y-auto rounded border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        로그인 시간
                                                    </TableHead>
                                                    <TableHead>
                                                        IP 주소
                                                    </TableHead>
                                                    <TableHead>
                                                        디바이스 식별
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {logs.map((log) => (
                                                    <TableRow key={log.id}>
                                                        <TableCell>
                                                            {formatDateTime(
                                                                log.loginAt
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {log.ipAddress}
                                                        </TableCell>
                                                        <TableCell className="max-w-[220px] truncate">
                                                            {log.deviceFingerprint ||
                                                                log.userAgent ||
                                                                "-"}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground">
                                        로그인 로그가 없습니다.
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>

                        <DialogFooter className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-xs text-muted-foreground">
                                사용자에게 영향을 주는 작업은 즉시 적용됩니다.
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={
                                        member.status === "ACTIVE"
                                            ? "destructive"
                                            : "outline"
                                    }
                                    onClick={() => onBanToggle(member)}
                                    disabled={isActionPending}
                                >
                                    {member.status === "ACTIVE"
                                        ? "정지"
                                        : "정지 해제"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => onRoleToggle(member)}
                                    disabled={isActionPending}
                                >
                                    {member.role === "MEMBER"
                                        ? "관리자 승격"
                                        : "관리자 강등"}
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => onOpenChange(false)}
                                >
                                    닫기
                                </Button>
                            </div>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

function DetailSection({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="space-y-3 rounded-lg border p-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
                {title}
            </h3>
            <div className="space-y-2 text-sm">{children}</div>
        </div>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground">{value}</span>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const style = STATUS_BADGE_STYLES[status];
    const variant = style?.variant ?? "outline";
    const className =
        style?.className ?? "border-border/60 bg-muted text-muted-foreground";

    return (
        <Badge variant={variant} className={cn("w-fit", className)}>
            {STATUS_LABELS[status] ?? status}
        </Badge>
    );
}

function MemberRoleBadge({ role }: { role: MemberRole }) {
    return (
        <Badge
            variant="outline"
            className={cn("w-fit border-dashed", ROLE_BADGE_STYLES[role])}
        >
            {ROLE_LABELS[role] ?? role}
        </Badge>
    );
}

function compareValues(
    a: string | number | Date | undefined | null,
    b: string | number | Date | undefined | null
) {
    if (a === b) return 0;
    if (a === undefined || a === null) return -1;
    if (b === undefined || b === null) return 1;

    if (a instanceof Date && b instanceof Date) {
        return a.getTime() - b.getTime();
    }

    if (typeof a === "number" && typeof b === "number") {
        return a - b;
    }

    const aString = typeof a === "string" ? a : String(a);
    const bString = typeof b === "string" ? b : String(b);
    return aString.localeCompare(bString, "ko", { numeric: true });
}

const SORT_ACCESSORS: Record<
    SortField,
    (member: Member) => string | number | Date | null
> = {
    status: (member) => member.status,
    name: (member) => member.name ?? "",
    nickname: (member) => member.nickname ?? "",
    phoneNumber: (member) => member.phoneNumber ?? "",
    email: (member) => member.email ?? "",
    role: (member) => member.role,
    createdAt: (member) => new Date(member.createdAt),
    latestSeasonBestStreak: (member) => member.latestSeasonBestStreak ?? 0,
    latestSeasonRank: (member) => member.latestSeasonRank ?? "",
};

function formatDate(dateString: string) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return "-";
    }
    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

function formatDateTime(dateString: string) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return "-";
    }
    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function formatRelativeTime(dateString: string) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    const now = Date.now();
    const diff = now - date.getTime();

    if (diff < 0) {
        return "예정됨";
    }

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = 30 * day;
    const year = 12 * month;

    if (diff < minute) {
        return "방금 전";
    }
    if (diff < hour) {
        const minutes = Math.floor(diff / minute);
        return `${minutes}분 전`;
    }
    if (diff < day) {
        const hours = Math.floor(diff / hour);
        return `${hours}시간 전`;
    }
    if (diff < month) {
        const days = Math.floor(diff / day);
        return `${days}일 전`;
    }
    if (diff < year) {
        const months = Math.floor(diff / month);
        return `${months}개월 전`;
    }

    const years = Math.floor(diff / year);
    return `${years}년 전`;
}

function createAvatarInitial(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
        return "?";
    }

    const chars = Array.from(trimmed);
    const initials = chars.slice(0, 2).join("");
    return initials.toUpperCase();
}

function formatNumber(value: number) {
    return new Intl.NumberFormat("ko-KR").format(value);
}

function formatPercentage(value: number, maximumFractionDigits = 1) {
    if (!Number.isFinite(value)) {
        return "-";
    }

    return new Intl.NumberFormat("ko-KR", {
        style: "percent",
        minimumFractionDigits: 0,
        maximumFractionDigits,
    }).format(value);
}

function useMemberLoginLogs(memberId: number | null) {
    return useQuery({
        queryKey: ["admin.member.loginLogs", memberId],
        queryFn: () => getMemberLoginLogs({ id: memberId as number }),
        enabled: !!memberId,
        staleTime: 1000 * 60 * 5,
    });
}

function useInvalidateMembersMutation(
    mutationFn: ({ id }: { id: number }) => Promise<DefaultResponse<unknown>>,
    queryClient: ReturnType<typeof useQueryClient>,
    onError?: (error: AxiosError<DefaultResponse<unknown>>) => void
): MutationWithErrorHandling {
    return useMutation({
        mutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin.members"] });
        },
        onError,
    });
}
