module.exports = {
  resolvers: {
    SimpleProductView: {
      rating: {
        selectionSet: "{sku}",
        resolve: (root, args, context, info) => {
          return context.Ratings.Query.ratings({
            root,
            args,
            context,
            info,
            selectionSet: "{average, total}",
          })
            .then((response) => {
              return response;
            })
            .catch(() => {
              return null;
            });
        },
      },
    },
  },
};
