-- Invoice 建立改由 RPC 完成（用 auth.uid()），唔使 Next.js 設定 SUPABASE_SERVICE_ROLE_KEY

create or replace function public.create_invoice_with_number(
  p_invoice_date date,
  p_client_name text,
  p_description text,
  p_amount numeric,
  p_currency text,
  p_payment_method text,
  p_notes text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  c int;
  inv_no text;
  new_id uuid;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  if p_currency not in ('HKD', 'USD') then
    raise exception 'invalid currency';
  end if;

  if p_payment_method not in ('fps', 'bank_transfer', 'paypal') then
    raise exception 'invalid payment method';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid amount';
  end if;

  if length(trim(p_client_name)) < 1 or length(p_client_name) > 200 then
    raise exception 'invalid client_name';
  end if;

  if length(trim(p_description)) < 1 or length(p_description) > 2000 then
    raise exception 'invalid description';
  end if;

  if p_notes is not null and length(p_notes) > 2000 then
    raise exception 'invalid notes';
  end if;

  update public.profiles
  set
    invoice_counter = coalesce(invoice_counter, 0) + 1,
    updated_at = now()
  where id = uid
  returning invoice_counter into c;

  if c is null then
    raise exception 'profile not found';
  end if;

  inv_no := 'INV-' || lpad(c::text, 4, '0');

  insert into public.invoices (
    user_id,
    invoice_number,
    invoice_date,
    client_name,
    description,
    amount,
    currency,
    payment_method,
    notes
  )
  values (
    uid,
    inv_no,
    p_invoice_date,
    trim(p_client_name),
    trim(p_description),
    p_amount,
    p_currency,
    p_payment_method,
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.create_invoice_with_number(
  date,
  text,
  text,
  numeric,
  text,
  text,
  text
) to authenticated;
