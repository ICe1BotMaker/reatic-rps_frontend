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
import { useState } from "react";
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

    const queryClient = useQueryClient();

    const { data: participantsData } = useSeasonParticipants(
        selectedSeasonId || 0
    );
    const { data: logsData } = useSeasonLogs(selectedSeasonId || 0);

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

    if (isLoading) {
        return (
            <div className="flex-1 p-[50px]">
                <div>로딩 중...</div>
            </div>
        );
    }

    const seasons = seasonsData?.data || [];

    return (
        <div className="flex-1">
            <div className="p-[50px] flex flex-col gap-[50px]">
                <div className="flex justify-end items-center">
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
                            <TableHead>상태</TableHead>
                            <TableHead>시즌 이름</TableHead>
                            <TableHead>시작 날짜</TableHead>
                            <TableHead>끝 날짜</TableHead>
                            <TableHead>생성일</TableHead>
                            <TableHead>관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {seasons.map((season) => (
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
                <Dialog open={logsDialog} onOpenChange={setLogsDialog}>
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
                                        <TableHead>게임 ID</TableHead>
                                        <TableHead>플레이어 이메일</TableHead>
                                        <TableHead>연승 횟수</TableHead>
                                        <TableHead>진행 시간</TableHead>
                                        <TableHead>상태</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logsData?.data.content?.map(
                                        (log, index) => (
                                            <TableRow
                                                key={`${log.gameId}-${index}`}
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
                                        )
                                    )}
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
