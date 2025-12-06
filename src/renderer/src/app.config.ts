export const CONFIG = {
  style: {
    title: {
      className: "flex-1 extra-expanded w-full leading-[1] text-[clamp(2rem,2.5vw,2.33rem)] mt-0 font-light text-gray-600 dark:text-gray-300 truncate line-clamp-1",
    },
    input: {
      className: "w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
    },
    select: {
      trigger: "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
      content: "z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md",
      item: "relative flex w-full select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 dark:focus:bg-gray-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    },
  },
};
