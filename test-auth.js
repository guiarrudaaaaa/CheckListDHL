// Script de teste para verificar Firebase Auth
console.log("=== TESTE FIREBASE AUTH ===");

// Verificar se Firebase foi inicializado via módulo
if (window.firebaseAuth && window.firebaseApp) {
  console.log("✅ Firebase modular inicializado");
  console.log("Project ID:", window.firebaseAuth.app.options.projectId);

  // Testar conexão
  window.firebaseAuth.onAuthStateChanged((user) => {
    console.log("🔄 Estado de autenticação:", user ? `Logado como ${user.email}` : "Não logado");
  });
} else {
  console.error("❌ Firebase Auth não inicializado ou firebase-init.js não carregado");
}

console.log("=== FIM DO TESTE ===");