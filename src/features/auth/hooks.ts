import { useQuery } from "@tanstack/react-query";
import { getUser } from "./api";

// 내 정보 조회 query
export const useUser = () => {
    return useQuery({
        queryKey: ["mypage"],
        queryFn: async () => await getUser(),
        retry: false,
    });
};
