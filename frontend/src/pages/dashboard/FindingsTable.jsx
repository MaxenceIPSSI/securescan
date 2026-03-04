import { SEVERITY_COLOR, OWASP_COLOR } from "./data";

export default function FindingsTable({ filtered, total }) {
  return (
    <div className="table-section">
      <div className="table-header">
        Résultat des analyses de sécurité détaillé — {filtered.length} / {total} entrées
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fichier</th>
              <th>Ligne</th>
              <th>Description</th>
              <th>Sévérité</th>
              <th>Catégorie OWASP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5}><div className="empty">Aucun résultat pour ces filtres</div></td></tr>
            ) : filtered.map((f, i) => {
              const sev = SEVERITY_COLOR[f.severity] || SEVERITY_COLOR["Faible"];
              return (
                <tr key={i}>
                  <td className="td-file">{f.file}</td>
                  <td className="td-line">{f.line ?? "–"}</td>
                  <td><span className="td-desc" title={f.desc}>{f.desc}</span></td>
                  <td>
                    <span className="badge-sev" style={{ background: sev.bg, color: sev.text, borderColor: sev.border }}>
                      {f.severity}
                    </span>
                  </td>
                  <td>
                    <div className="badge-owasp">
                      <span className="owasp-pill" style={{ background: OWASP_COLOR[f.owasp] || "#6b7280" }}>{f.owasp}</span>
                      <span className="owasp-cat" title={f.category}>{f.category}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
