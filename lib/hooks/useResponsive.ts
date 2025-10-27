import { useResponsiveStore } from "../store/useResponsiveStore";


export const useResponsive = () => {
    const {isMobile} = useResponsiveStore();
    return {isMobile}
}