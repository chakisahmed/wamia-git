let notifyFn: (msg: string) => void = () => {}

export function registerNotification(fn: (msg: string) => void) {
  notifyFn = fn
}

export function notify(message: string) {
  notifyFn(message)
}