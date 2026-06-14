import { useState } from "react";
import type { UserRole } from "../../types";
import { PinKeypad } from "./PinKeypad";

interface LoginScreenProps {
  onLogin: (role: UserRole, pin: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function LoginScreen({ onLogin, isLoading, error, clearError }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  if (selectedRole) {
    return (
      <div className="login-screen pin-mode">
        <h1 className="app-title">
          {selectedRole === "sister" ? "姐姐登入" : selectedRole === "brother" ? "弟弟登入" : "家長登入"}
        </h1>
        <p className="login-subtitle">請輸入 6 位數密碼</p>
        <div style={{ marginTop: '2rem' }}>
          <PinKeypad
            onSubmit={(pin) => onLogin(selectedRole, pin)}
            isLoading={isLoading}
            error={error}
            onClose={() => {
              setSelectedRole(null);
              clearError();
            }}
            clearError={clearError}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-header">
        <div className="login-logo">
          <span className="logo-emoji">🐷</span>
        </div>
        <h1 className="app-title">Kids Bank</h1>
        <p className="login-subtitle">請選擇你的身分</p>
      </div>

      <div className="role-selection">
        <button className="role-card role-sister" onClick={() => setSelectedRole("sister")}>
          <span className="role-emoji">👧</span>
          <h2>姐姐</h2>
        </button>
        
        <button className="role-card role-brother" onClick={() => setSelectedRole("brother")}>
          <span className="role-emoji">👦</span>
          <h2>弟弟</h2>
        </button>
        
        <button className="role-card role-parent" onClick={() => setSelectedRole("parent")}>
          <span className="role-emoji">👨‍👩‍👧‍👦</span>
          <h2>家長</h2>
        </button>
      </div>
    </div>
  );
}
