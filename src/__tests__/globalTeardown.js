module.exports = async () => {
  // Wait for any pending promises to resolve
  await new Promise(resolve => setImmediate(resolve));
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
}; 