export default function Content() {
  return (
    <main className="app-main" id="main" tabindex="-1">
      <div className="app-content-header">
        <div className="container-fluid">
          <div className="row">
            <div className="col-sm-6">
              <h3 className="mb-0">Campaigns</h3>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-end">
                <li className="breadcrumb-item">
                  <a href="#">Home</a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Dashboard
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      <div className="app-content">
        <div className="container-fluid"></div>
      </div>
    </main>
  );
}
