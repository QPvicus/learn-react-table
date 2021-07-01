/*
 * @Author: Taylor Swift
 * @Date: 2021-06-16 08:48:42
 * @LastEditTime: 2021-07-01 17:15:26
 * @Description:
 */
import { asyncScheduler, BehaviorSubject, defer, fromEvent, Subscription } from 'rxjs'
import { map, throttleTime } from 'rxjs/operators'
export const STYLED_REF_PROP = 'ref'

export const AUTO_VIRTUAL_THRESHOLD = 100

export const OVERSCAN_SIZE = 100

export function sum(arr: number[]) {
  let result = 0
  arr.forEach((x) => {
    result += x
  })
  return result
}
/** 获取默认的滚动条大小 */
function getScrollBarSizeImpl() {
  const scrollDiv = document.createElement('div')

  scrollDiv.style.position = 'absolute'
  scrollDiv.style.width = '100px'
  scrollDiv.style.height = '100px'
  scrollDiv.style.overflow = 'scroll'
  scrollDiv.style.top = '-9999px'
  document.body.appendChild(scrollDiv)
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
  const scrollbarHeight = scrollDiv.offsetHeight - scrollDiv.clientHeight
  document.body.removeChild(scrollDiv)
  return {
    width: scrollbarWidth,
    height: scrollbarHeight,
  }
}

export const throttledWindowResize$ = defer(() =>
  fromEvent(window, 'resize', { passive: true }).pipe(
    throttleTime(150, asyncScheduler, { leading: true, trailing: true }),
  ),
)

let scrollBarSize$: BehaviorSubject<{ width: number; height: number }>
export function getScrollbarSize() {
  if (scrollBarSize$ == null) {
    scrollBarSize$ = new BehaviorSubject(getScrollBarSizeImpl())
    throttledWindowResize$.pipe(map(() => getScrollBarSizeImpl())).subscribe(scrollBarSize$)
  }

  return scrollBarSize$.value
}

/** 同步多个元素之间的 scrollLeft, 每当 scrollLeft 发生变化时 callback 会被调用 */
export function syncScrollLeft(elements: HTMLElement[], callback: (scrollLeft: number) => void): Subscription {
  const bypassSet: Set<HTMLElement> = new Set()
  function publishScrollLeft(origin: HTMLElement, scrollLeft: number) {
    bypassSet.clear()
    for (const element of elements) {
      if (element === origin) {
        continue
      }
      element.scrollLeft = scrollLeft
      bypassSet.add(element)
    }
  }

  const subscription = new Subscription()

  for (const ele of elements) {
    const listener = () => {
      if (bypassSet.has(ele)) {
        bypassSet.delete(ele)
        return
      }
      const scrollLeft = ele.scrollLeft
      publishScrollLeft(ele, scrollLeft)
      callback(scrollLeft)
    }
    ele.addEventListener('scroll', listener, { passive: true })
    subscription.add(() => ele.removeEventListener('scroll', listener))
  }

  return subscription
}
