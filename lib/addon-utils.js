var hasKeyword = function(addon, keyword) {
  var keywords = addon.pkg.keywords;
  return keywords.indexOf(keyword) > -1;
};

var filterByKeyword = function(addons, keyword) {
  var results = [];
  for (var i = 0; i < addons.length; i++) {
    if (hasKeyword(addons[i], keyword)) {
      results.push(addons[i]);
    }
  }

  return results;
};

module.exports = {
  hasKeyword: hasKeyword,
  filterByKeyword: filterByKeyword
};
