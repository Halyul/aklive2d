import Home from "@/routes/path/Home";
import Operator from "@/routes/path/Operator";

export default [
    {
        path: "/",
        index: true,
        name: "home",
        element: <Home />,
        inDrawer: true,
        routeable: true
    }, {
        path: "https://gura.ch/dynamicCompile",
        index: false,
        name: "official_page",
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