import TradeDetail from '@/components/TradeDetail';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Trade( { params } ) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('sid')?.value;

  if (!token) {
    redirect('/login');  
  }

  return (
    <>
      <title>Assetly - Trade</title>
      <TradeDetail id={id} />
    </>
  );
}