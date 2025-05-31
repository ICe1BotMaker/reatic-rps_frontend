import { useQuery } from "@tanstack/react-query";
import { getMembers } from "./api";

// 회원 목록 조회 query
export const useMembers = () => {
    return useQuery({
        queryKey: ["admin.members"],
        queryFn: async () => await getMembers(),
        retry: false,
    });
};
