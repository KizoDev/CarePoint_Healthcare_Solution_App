const notFoundHandler = (req, res, next) => {
  res.status(404).json({ msg: "Route does not exist" });
};

export default notFoundHandler;

  