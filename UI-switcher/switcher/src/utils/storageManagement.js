export const setAuthToken = (token) => {
  sessionStorage.setItem("token", token);
};

export const getAuthToken = () => {
  return sessionStorage.getItem("token");
};

export const setPlayerId = (id) => {
  sessionStorage.setItem("id", id);
};

export const getPlayerId = () => {
  return sessionStorage.getItem("id");
};

export const setBoardStorage = (board) => {
  sessionStorage.setItem("board", JSON.stringify(board));
};

export const getBoardStorage = () => {
  const board = sessionStorage.getItem("board");
  return JSON.parse(board);
};

export const setFigureStorage = (figures) => {
  const figuresJSON = JSON.stringify(figures);
  sessionStorage.setItem("figures", figuresJSON);
};


export const getFigureStorage = () => {
  const figures = sessionStorage.getItem("figures");
  return JSON.parse(figures);
}