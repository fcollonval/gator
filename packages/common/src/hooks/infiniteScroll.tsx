import {useCallback} from 'react'

export default function useInfiniteScroll(
    onIntersect: () => void
): (node: HTMLDivElement) => void {

    const callback = useCallback((entries) => {
        if (entries[0].isIntersecting) {
            onIntersect()
        }
    }, [onIntersect])

    const infiniteScrollRef = useCallback((node) => {
        if (node) {
            const intersectionObserver = new IntersectionObserver(callback)
            intersectionObserver.observe(node)
        }
    }, [callback])
    return infiniteScrollRef
}
