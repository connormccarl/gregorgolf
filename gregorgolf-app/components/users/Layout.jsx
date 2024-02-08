import Header from "../Header";

export { Layout };

function Layout({ children }) {
    return (
        <div className="p-4">
            <Header />
            <div className="container">
                {children}
            </div>
        </div>
    );
}