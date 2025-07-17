module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  root.find(j.ExpressionStatement, {
    expression: {
      callee: {
        object: { name: "console" }
      }
    }
  }).replaceWith(path => {
    // Get the original code for this statement
    const original = fileInfo.source.substring(path.value.start, path.value.end);
    // Comment out the original statement
    return j.emptyStatement.from({
      comments: [j.commentLine(' ' + original)]
    });
  });

  return root.toSource({ quote: 'single' });
};
