import type { PageServerLoad } from './$types';
import { MachineService } from '$lib/services/move-service';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	try {
		const list = await MachineService.fetchMachineList(0, 1);
		const machines = await MachineService.fetchMachineBatch(0, 100);
		return { machines, total: list.count };
	} catch (e) {
		throw error(500, 'Failed to load machines');
	}
};
