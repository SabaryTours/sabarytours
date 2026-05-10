import { NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Invalid review id' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.status === 'string') {
      updates.status = body.status;
    }
    if (typeof body.name === 'string') {
      updates.name = body.name.trim();
    }
    if (typeof body.message === 'string') {
      updates.message = body.message.trim();
    }
    if (typeof body.rating === 'number' && Number.isFinite(body.rating)) {
      updates.rating = body.rating;
    }
    if (typeof body.image_url === 'string') {
      updates.image_url = body.image_url.trim() || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    // Verify admin (use getUser, not getSession)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update review';
    console.error('Error updating review status:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Invalid review id' }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    // Verify admin (use getUser, not getSession)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json(
      { message: 'Deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete review';
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
