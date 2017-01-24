const hasKeyword = (addon, keyword) => addon.pkg.keywords.indexOf(keyword) > -1;

const filterByKeyword = (addons, keyword) =>
  addons.filter((addon) => hasKeyword(addon, keyword));

const getName = (addon) => (addon.pkg && addon.pkg.name) || addon.name;

module.exports = {
  filterByKeyword,
  getName,
  hasKeyword,
};
