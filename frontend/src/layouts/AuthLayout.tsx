import { Outlet } from "react-router-dom";

export function AuthLayout() {
    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-sm-10 col-md-6 col-lg-4">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
