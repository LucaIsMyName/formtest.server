export const CONFIG = {
  language: "de",
  style: {
    title: {
      className: "flex-1 font-regular w-full leading-[1] text-[clamp(2rem,2.5vw,2rem)] mt-0 font-light text-neutral-600 dark:text-neutral-300 truncate",
    },
    input: {
      className: "w-full px-3 py-2 text-sm rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
    },
    select: {
      trigger: "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
      content: "z-50 min-w-[8rem] overflow-hidden rounded-md border border-neutral-200 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-md",
      item: "relative flex w-full select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-neutral-100 dark:focus:bg-neutral-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    },
  },
};
