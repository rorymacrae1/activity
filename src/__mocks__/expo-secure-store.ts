export const getItem = jest.fn().mockReturnValue(null);
export const getItemAsync = jest.fn().mockResolvedValue(null);
export const setItem = jest.fn();
export const setItemAsync = jest.fn().mockResolvedValue(undefined);
export const deleteItemAsync = jest.fn().mockResolvedValue(undefined);
