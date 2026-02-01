import mysql from 'mysql2/promise'

async function test() {
  try {
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1803'
    })
    console.log('✅ MySQL conecta perfecto')
    await db.end()
  } catch (e) {
    console.error('❌ Error:', e.message)
  }
}

test()
