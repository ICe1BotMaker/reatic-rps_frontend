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
import { useMembers } from "@/features/admin/user/hooks";
import {
    banMember,
    unbanMember,
    promoteMember,
    demoteMember,
    getMemberLoginLogs,
} from "@/features/admin/user/api";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function User() {
    const { data: membersData, isLoading } = useMembers();
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(
        null
    );
    const [errorDialog, setErrorDialog] = useState<{
        open: boolean;
        title: string;
        message: string;
    }>({ open: false, title: "", message: "" });
    const queryClient = useQueryClient();

    const banMutation = useMutation({
        mutationFn: banMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin.members"] });
        },
    });

    const unbanMutation = useMutation({
        mutationFn: unbanMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin.members"] });
        },
    });

    const promoteMutation = useMutation({
        mutationFn: promoteMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin.members"] });
        },
        onError: (error: any) => {
            setErrorDialog({
                open: true,
                title: "승격 실패",
                message:
                    error.response?.data?.message ||
                    "승격 중 오류가 발생했습니다.",
            });
        },
    });

    const demoteMutation = useMutation({
        mutationFn: demoteMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin.members"] });
        },
        onError: (error: any) => {
            setErrorDialog({
                open: true,
                title: "강등 실패",
                message:
                    error.response?.data?.message ||
                    "강등 중 오류가 발생했습니다.",
            });
        },
    });

    const { data: loginLogsData } = useQuery({
        queryKey: ["admin.member.loginLogs", selectedMemberId],
        queryFn: () =>
            selectedMemberId
                ? getMemberLoginLogs({ id: selectedMemberId })
                : null,
        enabled: !!selectedMemberId,
    });

    const handleBanToggle = (memberId: number, currentStatus: string) => {
        if (currentStatus === "ACTIVE") {
            banMutation.mutate({ id: memberId });
        } else {
            unbanMutation.mutate({ id: memberId });
        }
    };

    const handleRoleToggle = (memberId: number, currentRole: string) => {
        if (currentRole === "USER") {
            promoteMutation.mutate({ id: memberId });
        } else {
            demoteMutation.mutate({ id: memberId });
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 p-[50px]">
                <div>로딩 중...</div>
            </div>
        );
    }

    const users = membersData?.data.content || [];

    return (
        <div className="flex-1">
            <div className="p-[50px]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>상태</TableHead>
                            <TableHead>이름</TableHead>
                            <TableHead>닉네임</TableHead>
                            <TableHead>전화번호</TableHead>
                            <TableHead>이메일</TableHead>
                            <TableHead>권한</TableHead>
                            <TableHead>가입일</TableHead>
                            <TableHead>관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <Badge
                                        variant={
                                            user.status === "ACTIVE"
                                                ? "default"
                                                : "destructive"
                                        }
                                    >
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.nickname}</TableCell>
                                <TableCell>{user.phoneNumber}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            user.role === "ADMIN"
                                                ? "default"
                                                : "outline"
                                        }
                                    >
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {new Date(
                                        user.createdAt
                                    ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="flex gap-[8px]">
                                    <Button
                                        variant={
                                            user.status === "ACTIVE"
                                                ? "destructive"
                                                : "default"
                                        }
                                        size="sm"
                                        onClick={() =>
                                            handleBanToggle(
                                                user.id,
                                                user.status
                                            )
                                        }
                                        disabled={
                                            banMutation.isPending ||
                                            unbanMutation.isPending
                                        }
                                    >
                                        {user.status === "ACTIVE"
                                            ? "정지"
                                            : "정지 해제"}
                                    </Button>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setSelectedMemberId(user.id)
                                                }
                                            >
                                                로그인 로그
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl">
                                            <DialogHeader>
                                                <DialogTitle>
                                                    {user.name} 로그인 로그
                                                </DialogTitle>
                                                <DialogDescription>
                                                    최근 로그인 기록을 확인할 수
                                                    있습니다.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="max-h-96 overflow-y-auto">
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
                                                                사용자 에이전트
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {loginLogsData?.data.content?.map(
                                                            (log) => (
                                                                <TableRow
                                                                    key={log.id}
                                                                >
                                                                    <TableCell>
                                                                        {new Date(
                                                                            log.loginAt
                                                                        ).toLocaleString()}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {
                                                                            log.ipAddress
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell className="max-w-xs truncate">
                                                                        {
                                                                            log.userAgent
                                                                        }
                                                                    </TableCell>
                                                                </TableRow>
                                                            )
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handleRoleToggle(user.id, user.role)
                                        }
                                        disabled={
                                            promoteMutation.isPending ||
                                            demoteMutation.isPending
                                        }
                                    >
                                        {user.role === "USER"
                                            ? "관리자 승격"
                                            : "관리자 강등"}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

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
