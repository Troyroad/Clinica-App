export async function startSession(req, res) {
  const { employee_id } = req.body;
  try {
    const [result] = await global.db.query(
      'INSERT INTO sessions (employee_id, start) VALUES (?, NOW())',
      [employee_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

export async function endSession(req, res) {
  const { employee_id } = req.body;
  try {
    await global.db.query(
      'UPDATE sessions SET end = NOW() WHERE employee_id = ? AND end IS NULL',
      [employee_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al finalizar sesión' });
  }
}
