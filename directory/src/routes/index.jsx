import Home from "@/routes/path/home";
import Operator from "@/routes/path/operator";

export default [
    {
        path: "",
        index: true,
        name: "Home",
        element: <Home />
    }, {
        path: "operator/:key",
        index: false,
        name: "Operator",
        element: <Operator />
    }
]