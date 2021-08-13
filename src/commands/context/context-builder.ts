import commander from 'commander';
import Context from '../../lib/Context';

export default function contextCommandBuilder() {
  const context = new commander.Command('context').description('Context Commands');
  context
    .command('add')
    .description('Add Context')
    .requiredOption('-t, --token [token]', 'Token')
    .requiredOption('-n, --name [name]', 'Context name')
    .asyncAction(Context.addContext);
    context
    .command('list')
    .description('List all contexts')
    .asyncAction(Context.listContext);
  

		return context;
}
