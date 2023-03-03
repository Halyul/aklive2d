import React from "react";
import Home from "@/routes/path/home";
import Operator from "@/routes/path/operator";
import Changelogs from "@/routes/path/changelogs";

export default [
    {
        path: "/",
        index: true,
        name: "home",
        element: <Home />,
        inDrawer: true
    }, {
        path: "changelogs",
        index: false,
        name: "changelogs",
        element: <Changelogs />,
        inDrawer: true
    }, {
        path: "https://ak.hypergryph.com/archive/dynamicCompile/",
        index: false,
        name: "offical_page",
        element: <a/>,
        inDrawer: true
    }, {
        path: ":key",
        index: false,
        name: "operator",
        element: <Operator />,
        inDrawer: false
    },
]