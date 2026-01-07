import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const ghostCategorySchema = z.enum([
  'Process Inefficiency',
  'Technical Issue',
  'Communication Gap',
  'Data Quality',
  'User Experience',
  'Compliance Risk',
  'Other',
]);

const createGhostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be less than 5000 characters'),
  category: ghostCategorySchema.optional().default('Other'),
  impact: z.number().int().min(1).max(5).or(z.string().transform((val) => parseInt(val, 10))),
  effort: z.number().int().min(1).max(5).or(z.string().transform((val) => parseInt(val, 10))).optional().default(3),
  email: z.string().email().optional().or(z.literal('')),
  reporterEmail: z.string().email().optional().or(z.literal('')),
  reporter: z.string().min(1).max(100).optional(),
  department: z.string().max(100).optional(),
  geography: z.string().max(100).optional(),
  riskType: z.array(z.string()).optional().default([]),
  url: z.string().url().optional().or(z.literal('')).or(z.null()),
  pageTitle: z.string().max(300).optional(),
  screenshot: z.string().optional().or(z.null()),
});

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const rawData = await req.json();

    const validationResult = createGhostSchema.safeParse(rawData);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: errors }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const ghostData = validationResult.data;
    const ghostId = `ghost-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const { data, error } = await supabaseClient
      .from('ghosts')
      .insert({
        ghost_id: ghostId,
        title: ghostData.title,
        description: ghostData.description,
        category: ghostData.category,
        impact: ghostData.impact,
        effort: ghostData.effort,
        priority: ghostData.impact >= 4 ? 'High' : ghostData.impact >= 3 ? 'Medium' : 'Low',
        email: ghostData.email || user.email || '',
        reporter_email: ghostData.reporterEmail || user.email || '',
        reporter: ghostData.reporter || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Anonymous',
        department: ghostData.department || '',
        geography: ghostData.geography || '',
        risk_type: ghostData.riskType,
        url: ghostData.url || null,
        page_title: ghostData.pageTitle || '',
        screenshot: ghostData.screenshot || null,
        timestamp: timestamp,
        date_reported: timestamp,
        status: 'Reported',
        assigned_to: null,
        resolution_notes: '',
        points_awarded: 0,
        escalated: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to submit ghost', details: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, ghost: data }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});