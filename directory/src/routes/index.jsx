import Home from "@/routes/path/home";
import Operator from "@/routes/path/operator";
import News from "@/routes/path/news";

export default [
    {
        path: "/",
        index: true,
        name: "home",
        element: <Home />,
        inDrawer: true
    }, {
        path: "operator/:key",
        index: false,
        name: "operator",
        element: <Operator />,
        inDrawer: false
    }, {
        path: "news",
        index: false,
        name: "news",
        element: <News />,
        inDrawer: true
    }, {
        path: "https://ak.hypergryph.com/archive/dynamicCompile/",
        index: false,
        name: "offical_page",
        element: <a/>,
        inDrawer: true
    }
]