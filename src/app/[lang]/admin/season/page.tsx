/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSeasons, createSeason } from "@/features/season/api";
import { pauseSeason, resumeSeason } from "@/features/admin/season/api";
import {
    useSeasonParticipants,
    useSeasonLogs,
} from "@/features/admin/season/hooks";
import { useQuery } from "@tanstack/react-query";

export default function Season() {
    const { data: seasonsData, isLoading } = useQuery({
        queryKey: ["seasons"],
        queryFn: getSeasons,
        retry: false,
    });

    const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(
        null
    );
    const [createSeasonDialog, setCreateSeasonDialog] = useState(false);
    const [participantsDialog, setParticipantsDialog] = useState(false);
    const [logsDialog, setLogsDialog] = useState(false);
    const [errorDialog, setErrorDialog] = useState<{
        open: boolean;
        title: string;
        message: string;
    }>({ open: false, title: "", message: "" });

    const [newSeason, setNewSeason] = useState({
        seasonName: "",
        startDateTime: "",
        endDateTime: "",
    });

    // Search and pagination states
    const [searchFilters, setSearchFilters] = useState({
        seasonName: "",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortField, setSortField] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [logSortField, setLogSortField] = useState<string>("");
    const [logSortDirection, setLogSortDirection] = useState<"asc" | "desc">(
        "asc"
    );

    const queryClient = useQueryClient();

    const { data: participantsData } = useSeasonParticipants(
        selectedSeasonId || 0
    );
    const { data: logsData } = useSeasonLogs(selectedSeasonId || 0);

    // Sort logs data
    const sortedLogsData = useMemo(() => {
        if (!logsData?.data.content) return [];

        const sortedLogs = [...logsData.data.content];

        if (logSortField) {
            sortedLogs.sort((a, b) => {
                let aValue = a[logSortField as keyof typeof a];
                let bValue = b[logSortField as keyof typeof b];

                // Handle date sorting
                if (logSortField === "createdAt") {
                    aValue = new Date(aValue as string).getTime();
                    bValue = new Date(bValue as string).getTime();
                }

                // Handle numeric sorting
                if (
                    logSortField === "gameId" ||
                    logSortField === "winningStreak"
                ) {
                    aValue = Number(aValue) || 0;
                    bValue = Number(bValue) || 0;
                }

                // Convert to string for comparison
                const aStr = String(aValue || "").toLowerCase();
                const bStr = String(bValue || "").toLowerCase();

                if (logSortDirection === "asc") {
                    return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
                } else {
                    return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
                }
            });
        }

        return sortedLogs;
    }, [logsData?.data.content, logSortField, logSortDirection]);

    const createSeasonMutation = useMutation({
        mutationFn: createSeason,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seasons"] });
            setCreateSeasonDialog(false);
            setNewSeason({
                seasonName: "",
                startDateTime: "",
                endDateTime: "",
            });
        },
        onError: (error: any) => {
            setErrorDialog({
                open: true,
                title: "시즌 생성 실패",
                message:
                    error.response?.data?.message ||
                    "시즌 생성 중 오류가 발생했습니다.",
            });
        },
    });

    const pauseSeasonMutation = useMutation({
        mutationFn: pauseSeason,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seasons"] });
        },
        onError: (error: any) => {
            setErrorDialog({
                open: true,
                title: "시즌 일시중지 실패",
                message:
                    error.response?.data?.message ||
                    "시즌 일시중지 중 오류가 발생했습니다.",
            });
        },
    });

    const resumeSeasonMutation = useMutation({
        mutationFn: resumeSeason,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seasons"] });
        },
        onError: (error: any) => {
            setErrorDialog({
                open: true,
                title: "시즌 재개 실패",
                message:
                    error.response?.data?.message ||
                    "시즌 재개 중 오류가 발생했습니다.",
            });
        },
    });

    const handlePauseToggle = (seasonId: number, isPaused: boolean) => {
        if (isPaused) {
            resumeSeasonMutation.mutate({ id: seasonId });
        } else {
            pauseSeasonMutation.mutate({ id: seasonId });
        }
    };

    const handleCreateSeason = () => {
        if (
            !newSeason.seasonName ||
            !newSeason.startDateTime ||
            !newSeason.endDateTime
        ) {
            setErrorDialog({
                open: true,
                title: "입력 오류",
                message: "모든 필드를 입력해주세요.",
            });
            return;
        }
        createSeasonMutation.mutate({
            ...newSeason,
            startDateTime: `${newSeason.startDateTime}T00:00:00`,
            endDateTime: `${newSeason.endDateTime}T00:00:00`,
        });
    };

    const openParticipantsDialog = (seasonId: number) => {
        setSelectedSeasonId(seasonId);
        setParticipantsDialog(true);
    };

    const openLogsDialog = (seasonId: number) => {
        setSelectedSeasonId(seasonId);
        setLogsDialog(true);
    };

    const closeLogsDialog = () => {
        setLogsDialog(false);
        setLogSortField("");
        setLogSortDirection("asc");
    };

    const seasons = useMemo(() => seasonsData?.data || [], [seasonsData?.data]);

    // Filter and sort seasons
    const filteredAndSortedSeasons = useMemo(() => {
        let filtered = seasons;

        // Apply search filters
        filtered = seasons.filter((season) => {
            const nameMatch = searchFilters.seasonName
                ? season.seasonName
                      ?.toLowerCase()
                      .includes(searchFilters.seasonName.toLowerCase())
                : true;
            return nameMatch;
        });

        // Apply sorting
        if (sortField) {
            filtered.sort((a, b) => {
                let aValue = a[sortField as keyof typeof a];
                let bValue = b[sortField as keyof typeof b];

                // Handle date sorting
                if (
                    sortField === "startDateTime" ||
                    sortField === "endDateTime" ||
                    sortField === "createdAt"
                ) {
                    aValue = new Date(aValue as string).getTime();
                    bValue = new Date(bValue as string).getTime();
                }

                // Convert to string for comparison
                const aStr = String(aValue || "").toLowerCase();
                const bStr = String(bValue || "").toLowerCase();

                if (sortDirection === "asc") {
                    return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
                } else {
                    return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
                }
            });
        }

        return filtered;
    }, [seasons, searchFilters, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(
        filteredAndSortedSeasons.length / itemsPerPage
    );
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSeasons = filteredAndSortedSeasons.slice(startIndex, endIndex);

    // Reset to first page when search changes
    const handleFilterChange = (
        field: keyof typeof searchFilters,
        value: string
    ) => {
        setSearchFilters((prev) => ({ ...prev, [field]: value }));
        setCurrentPage(1);
    };

    // Check if any filter is active
    const hasActiveFilters = Object.values(searchFilters).some(
        (value) => value !== ""
    );

    // Handle sorting
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Pagination handlers
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const getSortIcon = (field: string) => {
        if (sortField !== field) return "";
        return sortDirection === "asc" ? "↑" : "↓";
    };

    // Handle log sorting
    const handleLogSort = (field: string) => {
        if (logSortField === field) {
            setLogSortDirection(logSortDirection === "asc" ? "desc" : "asc");
        } else {
            setLogSortField(field);
            setLogSortDirection("asc");
        }
    };

    const getLogSortIcon = (field: string) => {
        if (logSortField !== field) return "";
        return logSortDirection === "asc" ? "↑" : "↓";
    };

    if (isLoading) {
        return (
            <div className="flex-1 p-[50px]">
                <div>로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="flex-1">
            <div className="p-[50px]">
                {/* Search and Info Section */}
                <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">시즌 관리</h1>
                        <div className="text-sm text-gray-600">
                            총 {filteredAndSortedSeasons.length}개
                            {hasActiveFilters &&
                                ` (전체 ${seasons.length}개 중 검색됨)`}
                        </div>
                    </div>
                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                시즌 이름
                            </label>
                            <Input
                                placeholder="시즌 이름 검색"
                                value={searchFilters.seasonName}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "seasonName",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSearchFilters({ seasonName: "" });
                                setSortField("");
                                setCurrentPage(1);
                            }}
                        >
                            초기화
                        </Button>
                    </div>
                </div>

                <div className="flex justify-end items-center mb-6">
                    <Dialog
                        open={createSeasonDialog}
                        onOpenChange={setCreateSeasonDialog}
                    >
                        <DialogTrigger asChild>
                            <Button variant="default">시즌 생성</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>새 시즌 생성</DialogTitle>
                                <DialogDescription>
                                    새로운 시즌을 생성합니다.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">
                                        시즌 이름
                                    </label>
                                    <Input
                                        value={newSeason.seasonName}
                                        onChange={(e) =>
                                            setNewSeason((prev) => ({
                                                ...prev,
                                                seasonName: e.target.value,
                                            }))
                                        }
                                        placeholder="시즌 이름을 입력하세요"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">
                                        시작 날짜
                                    </label>
                                    <Input
                                        type="date"
                                        value={newSeason.startDateTime}
                                        onChange={(e) =>
                                            setNewSeason((prev) => ({
                                                ...prev,
                                                startDateTime: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">
                                        종료 날짜
                                    </label>
                                    <Input
                                        type="date"
                                        value={newSeason.endDateTime}
                                        onChange={(e) =>
                                            setNewSeason((prev) => ({
                                                ...prev,
                                                endDateTime: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setCreateSeasonDialog(false)}
                                >
                                    취소
                                </Button>
                                <Button
                                    onClick={handleCreateSeason}
                                    disabled={createSeasonMutation.isPending}
                                >
                                    생성
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead
                                className="cursor-pointer hover:bg-gray-50 select-none"
                                onClick={() => handleSort("active")}
                            >
                                상태 {getSortIcon("active")}
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-gray-50 select-none"
                                onClick={() => handleSort("seasonName")}
                            >
                                시즌 이름 {getSortIcon("seasonName")}
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-gray-50 select-none"
                                onClick={() => handleSort("startDateTime")}
                            >
                                시작 날짜 {getSortIcon("startDateTime")}
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-gray-50 select-none"
                                onClick={() => handleSort("endDateTime")}
                            >
                                끝 날짜 {getSortIcon("endDateTime")}
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-gray-50 select-none"
                                onClick={() => handleSort("createdAt")}
                            >
                                생성일 {getSortIcon("createdAt")}
                            </TableHead>
                            <TableHead>관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentSeasons.map((season) => (
                            <TableRow key={season.id}>
                                <TableCell>
                                    <Badge
                                        variant={
                                            season.active
                                                ? season.paused
                                                    ? "destructive"
                                                    : "default"
                                                : "outline"
                                        }
                                    >
                                        {season.active
                                            ? season.paused
                                                ? "일시중지"
                                                : "활성"
                                            : "비활성"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{season.seasonName}</TableCell>
                                <TableCell>
                                    {new Date(
                                        season.startDateTime
                                    ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {new Date(
                                        season.endDateTime
                                    ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {new Date(
                                        season.createdAt
                                    ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="flex gap-[8px]">
                                    {season.active && (
                                        <Button
                                            variant={
                                                season.paused
                                                    ? "default"
                                                    : "destructive"
                                            }
                                            size="sm"
                                            onClick={() =>
                                                handlePauseToggle(
                                                    season.id,
                                                    season.paused
                                                )
                                            }
                                            disabled={
                                                pauseSeasonMutation.isPending ||
                                                resumeSeasonMutation.isPending
                                            }
                                        >
                                            {season.paused
                                                ? "재개"
                                                : "일시중지"}
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            openParticipantsDialog(season.id)
                                        }
                                    >
                                        참여자 목록
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            openLogsDialog(season.id)
                                        }
                                    >
                                        게임 로그
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                            {startIndex + 1}-
                            {Math.min(
                                endIndex,
                                filteredAndSortedSeasons.length
                            )}
                            페이지 (총 {filteredAndSortedSeasons.length}개 중)
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(1)}
                                disabled={currentPage === 1}
                            >
                                처음
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                이전
                            </Button>

                            <div className="flex items-center space-x-1">
                                {Array.from(
                                    { length: Math.min(5, totalPages) },
                                    (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (
                                            currentPage >=
                                            totalPages - 2
                                        ) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={
                                                    currentPage === pageNum
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    goToPage(pageNum)
                                                }
                                                className="w-8"
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    }
                                )}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                다음
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                마지막
                            </Button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {filteredAndSortedSeasons.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-gray-500">
                        {hasActiveFilters
                            ? "검색 결과가 없습니다."
                            : "시즌이 없습니다."}
                    </div>
                )}

                {/* Participants Dialog */}
                <Dialog
                    open={participantsDialog}
                    onOpenChange={setParticipantsDialog}
                >
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>시즌 참여자 목록</DialogTitle>
                            <DialogDescription>
                                현재 시즌에 참여하고 있는 사용자 목록입니다.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-96 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>이름</TableHead>
                                        <TableHead>닉네임</TableHead>
                                        <TableHead>이메일</TableHead>
                                        <TableHead>권한</TableHead>
                                        <TableHead>가입일</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {participantsData?.data.content?.map(
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
                                                        variant={
                                                            participant.role ===
                                                            "ADMIN"
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                    >
                                                        {participant.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(
                                                        participant.createdAt
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Logs Dialog */}
                <Dialog
                    open={logsDialog}
                    onOpenChange={(open) => {
                        if (!open) closeLogsDialog();
                    }}
                >
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>시즌 게임 로그</DialogTitle>
                            <DialogDescription>
                                시즌 게임 진행 기록을 확인할 수 있습니다.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-96 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead
                                            className="cursor-pointer hover:bg-gray-50 select-none"
                                            onClick={() =>
                                                handleLogSort("gameId")
                                            }
                                        >
                                            게임 ID {getLogSortIcon("gameId")}
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer hover:bg-gray-50 select-none"
                                            onClick={() =>
                                                handleLogSort("memberEmail")
                                            }
                                        >
                                            플레이어 이메일{" "}
                                            {getLogSortIcon("memberEmail")}
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer hover:bg-gray-50 select-none"
                                            onClick={() =>
                                                handleLogSort("winningStreak")
                                            }
                                        >
                                            연승 횟수{" "}
                                            {getLogSortIcon("winningStreak")}
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer hover:bg-gray-50 select-none"
                                            onClick={() =>
                                                handleLogSort("createdAt")
                                            }
                                        >
                                            진행 시간{" "}
                                            {getLogSortIcon("createdAt")}
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer hover:bg-gray-50 select-none"
                                            onClick={() =>
                                                handleLogSort("active")
                                            }
                                        >
                                            상태 {getLogSortIcon("active")}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedLogsData?.map((log, index) => (
                                        <TableRow
                                            key={`${log.gameId}-${index}`}
                                        >
                                            <TableCell>{log.gameId}</TableCell>
                                            <TableCell>
                                                {log.memberEmail}
                                            </TableCell>
                                            <TableCell>
                                                {log.winningStreak}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    log.createdAt
                                                ).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        log.active
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                >
                                                    {log.active
                                                        ? "진행중"
                                                        : "완료"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Error Dialog */}
                <Dialog
                    open={errorDialog.open}
                    onOpenChange={(open) =>
                        setErrorDialog((prev) => ({ ...prev, open }))
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
        </div>
    );
}
