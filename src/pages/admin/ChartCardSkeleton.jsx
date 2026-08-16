import ChartCard from './ChartCard';
import Skeleton from '../../components/ui/Skeleton';

export default function ChartCardSkeleton({ height = 240 }) {
  return (
    <ChartCard title={<Skeleton width="150px" height="1rem" />} dotColor="var(--admin-border)">
      <Skeleton width="100%" height={height} radius="10px" />
    </ChartCard>
  );
}
