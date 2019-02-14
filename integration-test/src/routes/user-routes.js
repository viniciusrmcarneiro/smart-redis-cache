const express = require("express");

const create = ({ update, create, read }) => {
    const app = express();
    app.get("/update/:id/:email", (req, res, next) => {
        console.log(`/update/${req.params.id}/${req.params.email}`);
        update({
            email: req.params.email,
            userId: req.params.id,
        })
            .then(res.json.bind(res))
            .catch(next);
    });

    app.get("/create/:email", (req, res, next) => {
        console.log(`/create/${req.params.email}`);

        create({ email: req.params.email })
            .then(res.json.bind(res))
            .catch(next);
    });

    app.get("/read/:id", (req, res, next) => {
        console.log(`/read/${req.params.id}`);
        read({ userId: req.params.id })
            .then(res.json.bind(res))
            .catch(next);
    });

    return app;
};
module.exports = { create };
