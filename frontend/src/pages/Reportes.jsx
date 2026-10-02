import Layout from '../components/Layout';
import './Reportes.css';

const Reportes = () => {
  const reportes = [
    { id: 1, titulo: 'Mantenimiento Mensual', fecha: '2026-07-15', tipo: 'Mantenimiento', estado: 'Completado' },
    { id: 2, titulo: 'Inspección de Árboles', fecha: '2026-07-10', tipo: 'Inspección', estado: 'Pendiente' },
    { id: 3, titulo: 'Reporte de Riego', fecha: '2026-07-05', tipo: 'Riego', estado: 'Completado' },
  ];

  return (
    <Layout>
      <div className="reportes-page">
        <div className="page-header">
          <h1>Reportes y Estadísticas</h1>
          <button className="btn-add">
            <i className="fas fa-plus"></i> Nuevo Reporte
          </button>
        </div>

        <div className="reportes-table">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map((reporte) => (
                <tr key={reporte.id}>
                  <td>{reporte.titulo}</td>
                  <td>{reporte.fecha}</td>
                  <td>{reporte.tipo}</td>
                  <td>
                    <span className={`badge ${reporte.estado.toLowerCase()}`}>
                      {reporte.estado}
                    </span>
                  </td>
                  <td>
                    <button className="btn-view">
                      <i className="fas fa-eye"></i> Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Reportes;