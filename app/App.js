import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
import Layout from './Pages/layout';

export default function App() {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Layout/>
    </ApplicationProvider>
  );
}
