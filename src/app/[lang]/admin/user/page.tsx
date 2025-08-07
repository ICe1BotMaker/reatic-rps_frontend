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
import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function User() {
    const { data: membersData, isLoading } = useMembers();
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(
        null
    );
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showUserDetail, setShowUserDetail] = useState(false);
    const [errorDialog, setErrorDialog] = useState<{
        open: boolean;
        title: string;
        message: string;
    }>({ open: false, title: "", message: "" });

    // Search and pagination states
    const [searchFilters, setSearchFilters] = useState({
        name: "",
        nickname: "",
        phoneNumber: "",
        email: "",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortField, setSortField] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
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

    const { data: selectedUserLoginLogs } = useQuery({
        queryKey: ["admin.member.loginLogs", selectedUser?.id],
        queryFn: () =>
            selectedUser?.id
                ? getMemberLoginLogs({ id: selectedUser.id })
                : null,
        enabled: !!selectedUser?.id,
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

    const users = useMemo(
        () => membersData?.data.content || [],
        [membersData?.data.content]
    );

    // Filter and sort users
    const filteredAndSortedUsers = useMemo(() => {
        let filtered = users;

        // Apply search filters
        filtered = users.filter((user) => {
            const nameMatch = searchFilters.name
                ? user.name
                      ?.toLowerCase()
                      .includes(searchFilters.name.toLowerCase())
                : true;
            const nicknameMatch = searchFilters.nickname
                ? user.nickname
                      ?.toLowerCase()
                      .includes(searchFilters.nickname.toLowerCase())
                : true;
            const phoneMatch = searchFilters.phoneNumber
                ? user.phoneNumber
                      ?.toLowerCase()
                      .includes(searchFilters.phoneNumber.toLowerCase())
                : true;
            const emailMatch = searchFilters.email
                ? user.email
                      ?.toLowerCase()
                      .includes(searchFilters.email.toLowerCase())
                : true;

            return nameMatch && nicknameMatch && phoneMatch && emailMatch;
        });

        // Apply sorting
        if (sortField) {
            filtered.sort((a, b) => {
                let aValue = a[sortField as keyof typeof a];
                let bValue = b[sortField as keyof typeof b];

                // Handle date sorting
                if (sortField === "createdAt") {
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
    }, [users, searchFilters, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

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
                        <h1 className="text-2xl font-bold">사용자 관리</h1>
                        <div className="text-sm text-gray-600">
                            총 {filteredAndSortedUsers.length}명
                            {hasActiveFilters &&
                                ` (전체 ${users.length}명 중 검색됨)`}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                이름
                            </label>
                            <Input
                                placeholder="이름 검색"
                                value={searchFilters.name}
                                onChange={(e) =>
                                    handleFilterChange("name", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                닉네임
                            </label>
                            <Input
                                placeholder="닉네임 검색"
                                value={searchFilters.nickname}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "nickname",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                전화번호
                            </label>
                            <Input
                                placeholder="전화번호 검색"
                                value={searchFilters.phoneNumber}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "phoneNumber",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                이메일
                            </label>
                            <Input
                                placeholder="이메일 검색"
                                value={searchFilters.email}
                                onChange={(e) =>
                                    handleFilterChange("email", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchFilters({
                                        name: "",
                                        nickname: "",
                                        phoneNumber: "",
                                        email: "",
                                    });
                                    setSortField("");
                                    setCurrentPage(1);
                                }}
                                className="w-full"
                            >
                                초기화
                            </Button>
                        </div>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead
                                className="cursor-pointer hover:bg-gray-50 select-none"
                                onClick={() => handleSort("status")}
                            >
                                상태 {getSortIcon("status")}
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-gray-50 select-none"
                                onClick={() => handleSort("name")}
                            >
                                이름 {getSortIcon("name")}
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-gray-50 select-none"
                                onClick={() => handleSort("nickname")}
                            >
                                닉네임 {getSortIcon("nickname")}
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-gray-50 select-none"
                                onClick={() => handleSort("phoneNumber")}
                            >
                                전화번호 {getSortIcon("phoneNumber")}
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-gray-50 select-none"
                                onClick={() => handleSort("email")}
                            >
                                이메일 {getSortIcon("email")}
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-gray-50 select-none"
                                onClick={() => handleSort("role")}
                            >
                                권한 {getSortIcon("role")}
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-gray-50 select-none"
                                onClick={() => handleSort("createdAt")}
                            >
                                가입일 {getSortIcon("createdAt")}
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-gray-50 select-none"
                                onClick={() =>
                                    handleSort("latestSeasonBestStreak")
                                }
                            >
                                마지막 시즌 최다 우승{" "}
                                {getSortIcon("latestSeasonBestStreak")}
                            </TableHead>
                            <TableHead>관리</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentUsers.map((user) => (
                            <TableRow 
                                key={user.id} 
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => {
                                    setSelectedUser(user);
                                    setShowUserDetail(true);
                                }}
                            >
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
                                <TableCell>
                                    {user.latestSeasonBestStreak
                                        ? `${user.latestSeasonBestStreak}번`
                                        : "없음"}
                                </TableCell>
                                <TableCell 
                                    className="flex gap-[8px]"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Button
                                        variant={
                                            user.status === "ACTIVE"
                                                ? "destructive"
                                                : "default"
                                        }
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleBanToggle(
                                                user.id,
                                                user.status
                                            );
                                        }}
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedMemberId(user.id);
                                                }}
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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRoleToggle(user.id, user.role);
                                        }}
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                            {startIndex + 1}-
                            {Math.min(endIndex, filteredAndSortedUsers.length)}
                            페이지 (총 {filteredAndSortedUsers.length}개 중)
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
                {filteredAndSortedUsers.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-gray-500">
                        {hasActiveFilters
                            ? "검색 결과가 없습니다."
                            : "사용자가 없습니다."}
                    </div>
                )}

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

                {/* User Detail Overlay */}
                <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        {selectedUser && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                            {selectedUser.profileImageUrl ? (
                                                <Image 
                                                    src={selectedUser.profileImageUrl} 
                                                    alt={selectedUser.name}
                                                    width={64}
                                                    height={64}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xl font-semibold text-gray-600">
                                                    {selectedUser.name?.charAt(0) || 'U'}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                                            <p className="text-gray-600">@{selectedUser.nickname}</p>
                                        </div>
                                    </DialogTitle>
                                </DialogHeader>
                                
                                <div className="space-y-6">
                                    {/* 기본 정보 */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold border-b pb-2">기본 정보</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-700">이름:</span>
                                                    <span>{selectedUser.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-700">닉네임:</span>
                                                    <span>{selectedUser.nickname}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-700">이메일:</span>
                                                    <span className="break-all">{selectedUser.email}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-700">전화번호:</span>
                                                    <span>{selectedUser.phoneNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold border-b pb-2">계정 정보</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-gray-700">상태:</span>
                                                    <Badge
                                                        variant={
                                                            selectedUser.status === "ACTIVE"
                                                                ? "default"
                                                                : "destructive"
                                                        }
                                                    >
                                                        {selectedUser.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-gray-700">권한:</span>
                                                    <Badge
                                                        variant={
                                                            selectedUser.role === "ADMIN"
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                    >
                                                        {selectedUser.role}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-700">가입일:</span>
                                                    <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-700">최다 우승:</span>
                                                    <span>
                                                        {selectedUser.latestSeasonBestStreak
                                                            ? `${selectedUser.latestSeasonBestStreak}번`
                                                            : "없음"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* 로그인 로그 */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold border-b pb-2">로그인 로그</h3>
                                        <div className="max-h-60 overflow-y-auto border rounded">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>로그인 시간</TableHead>
                                                        <TableHead>IP 주소</TableHead>
                                                        <TableHead>사용자 에이전트</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedUserLoginLogs?.data.content?.map((log: any) => (
                                                        <TableRow key={log.id}>
                                                            <TableCell>
                                                                {new Date(log.loginAt).toLocaleString()}
                                                            </TableCell>
                                                            <TableCell>{log.ipAddress}</TableCell>
                                                            <TableCell className="max-w-xs truncate">
                                                                {log.userAgent}
                                                            </TableCell>
                                                        </TableRow>
                                                    )) || (
                                                        <TableRow>
                                                            <TableCell colSpan={3} className="text-center py-4">
                                                                로그인 로그가 없습니다.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                    
                                    {/* 관리 버튼들 */}
                                    <div className="flex gap-4 pt-4 border-t">
                                        <Button
                                            variant={
                                                selectedUser.status === "ACTIVE"
                                                    ? "destructive"
                                                    : "default"
                                            }
                                            onClick={() => {
                                                handleBanToggle(selectedUser.id, selectedUser.status);
                                                setShowUserDetail(false);
                                            }}
                                            disabled={
                                                banMutation.isPending ||
                                                unbanMutation.isPending
                                            }
                                        >
                                            {selectedUser.status === "ACTIVE" ? "정지" : "정지 해제"}
                                        </Button>
                                        
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                handleRoleToggle(selectedUser.id, selectedUser.role);
                                                setShowUserDetail(false);
                                            }}
                                            disabled={
                                                promoteMutation.isPending ||
                                                demoteMutation.isPending
                                            }
                                        >
                                            {selectedUser.role === "USER" ? "관리자 승격" : "관리자 강등"}
                                        </Button>
                                        
                                        <Button
                                            variant="secondary"
                                            onClick={() => setShowUserDetail(false)}
                                        >
                                            닫기
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
