/** 系统「减弱动效」偏好。装饰性动画与过场动画都要先问一句。 */
export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
