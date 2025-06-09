export enum ButtonVariants {
    base = "transition-all duration-100 active:scale-[.975] w-full flex justify-center items-center gap-[10px] p-[16px_18px] rounded-[8px] font-p_semibold text-[16px]",

    // 기본
    white = `${ButtonVariants.base} bg-c_white text-c_primary_softlight`,
    white_light = `${ButtonVariants.base} bg-c_white_light text-white`,

    primary = `${ButtonVariants.base} bg-c_primary text-white`,
    primary_light = `${ButtonVariants.base} bg-c_primary_light text-c_primary_softlight`,

    disabled = `${ButtonVariants.base} bg-[#F4F4F4] text-[#A9A9A9]`,

    black = `${ButtonVariants.base} bg-c_black text-white`,

    // 외부
    kakao = `${ButtonVariants.base} bg-c_kakao text-c_kakao_black`,
}

interface ButtonProps {
    variants: keyof typeof ButtonVariants;
    Icon?: React.ReactNode;
    children?: React.ReactNode;
    onClick?: () => void;
}

export const Button = ({ variants, Icon, children, onClick }: ButtonProps) => {
    return (
        <div className={ButtonVariants[variants]} onClick={onClick}>
            {Icon}
            {children}
        </div>
    );
};
