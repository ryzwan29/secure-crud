import { ApiError } from "../utils/ApiError";
import { userRepository } from "../repositories/user.repository";
import { refreshTokenRepository } from "../repositories/refreshToken.repository";
import { SafeUser, User } from "../types";

function toSafeUser(user: User): SafeUser {
  const { password_hash, failed_login_attempts, ...safe } = user;
  void password_hash;
  void failed_login_attempts;
  return safe;
}

export const userService = {
  async listAll(): Promise<SafeUser[]> {
    const users = await userRepository.listAll();
    return users.map(toSafeUser);
  },

  async updateRole(id: number, role: "admin" | "user", actorId: number): Promise<SafeUser> {
    if (id === actorId) throw ApiError.badRequest("Tidak bisa mengubah role akun sendiri");
    const updated = await userRepository.updateRole(id, role);
    if (!updated) throw ApiError.notFound("User tidak ditemukan");
    return toSafeUser(updated);
  },

  async setActive(id: number, isActive: boolean, actorId: number): Promise<SafeUser> {
    if (id === actorId) throw ApiError.badRequest("Tidak bisa menonaktifkan akun sendiri");
    const updated = await userRepository.setActive(id, isActive);
    if (!updated) throw ApiError.notFound("User tidak ditemukan");
    if (!isActive) {
      // Force logout everywhere when an account is deactivated.
      await refreshTokenRepository.revokeAllForUser(id);
    }
    return toSafeUser(updated);
  },
};
