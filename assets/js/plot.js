export const plots = {
  stateDistribution: {
    onClick: toggleProtocol("stateDistribution"),
  }
};
function toggleProtocol(key) {
  return () => {
    document.getElementById(key).classList.toggle("show");
    console.log('poof')
  };
}