export const callerFile = (callerFilename: string): string | undefined => {
  const save = Error.prepareStackTrace;

  try {
    Error.prepareStackTrace = (_, stack) => stack;
    const stack = new Error().stack as unknown as NodeJS.CallSite[];
    
    for (const site of stack) {
      const file = site.getFileName();
      if (file && file !== __filename && file !== callerFilename) {
        return file;
      }
    }
  } finally {
    Error.prepareStackTrace = save;
  }
};
