import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';
import { registerSchema } from '@/utils/validators';
import { AuditService } from '@/services/audit.service';
import { AUDIT_ACTIONS } from '@/utils/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create user
    const user = await UserService.createUser(data);

    // Create audit log
    await AuditService.createLog({
      action: AUDIT_ACTIONS.CREATE,
      entity: 'User',
      entityId: user._id.toString(),
      userId: user._id.toString(),
      userName: user.name,
      userRole: user.role,
      metadata: { email: user.email, role: user.role },
    });

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 500 }
    );
  }
}
