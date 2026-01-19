import User, { IUser } from '@/models/User';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import { UserRole } from '@/utils/constants';

export interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  address?: string;
  department?: string;
}

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(params: CreateUserParams): Promise<IUser> {
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: params.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(params.password, 10);

    // Create user
    const user = await User.create({
      ...params,
      password: hashedPassword,
    });

    return user;
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<IUser | null> {
    await connectDB();

    const user = await User.findById(userId).lean();
    return user as IUser | null;
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<IUser | null> {
    await connectDB();

    const user = await User.findOne({ email }).lean();
    return user as IUser | null;
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: UserRole): Promise<IUser[]> {
    await connectDB();

    const users = await User.find({ role, isActive: true }).lean();
    return users as IUser[];
  }

  /**
   * Get all officers
   */
  static async getOfficers(filters?: { department?: string }): Promise<IUser[]> {
    await connectDB();

    const query: any = { role: 'OFFICER', isActive: true };
    if (filters?.department) {
      query.department = filters.department;
    }

    const officers = await User.find(query).lean();
    return officers as IUser[];
  }

  /**
   * Update user
   */
  static async updateUser(
    userId: string,
    updates: Partial<CreateUserParams>
  ): Promise<IUser | null> {
    await connectDB();

    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).lean();

    return user as IUser | null;
  }

  /**
   * Deactivate user
   */
  static async deactivateUser(userId: string): Promise<void> {
    await connectDB();

    await User.findByIdAndUpdate(userId, { isActive: false });
  }

  /**
   * Activate user
   */
  static async activateUser(userId: string): Promise<void> {
    await connectDB();

    await User.findByIdAndUpdate(userId, { isActive: true });
  }

  /**
   * Get all users with pagination
   */
  static async getAllUsers(filters: {
    role?: UserRole;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ users: IUser[]; total: number; page: number; totalPages: number }> {
    await connectDB();

    const { page = 1, limit = 20, ...queryFilters } = filters;

    const query: any = {};
    if (queryFilters.role) query.role = queryFilters.role;
    if (queryFilters.isActive !== undefined) query.isActive = queryFilters.isActive;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    return {
      users: users as IUser[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
