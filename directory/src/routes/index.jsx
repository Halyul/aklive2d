import React from "react";
import Home from "@/routes/path/Home";
import Operator from "@/routes/path/Operator";
import Changelogs from "@/routes/path/Changelogs";

export default [
    {
        path: "/",
        index: true,
        name: "home",
        element: <Home />,
        inDrawer: true,
        routeable: true
    }, {
        path: "changelogs",
        index: false,
        name: "changelogs",
        element: <Changelogs />,
        inDrawer: true,
        routeable: true
    }, {
        path: "https://gura.ch/dynamicCompile",
        index: false,
        name: "offical_page",
        element: <a/>,
        inDrawer: true,
        routeable: false
    }, {
        path: ":key",
        index: false,
        name: "operator",
        element: <Operator />,
        inDrawer: false,
        routeable: true
    },
]