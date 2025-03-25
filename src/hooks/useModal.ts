import { Slot, VNode, Reactive, getCurrentInstance, defineComponent, reactive, createVNode, render, provide, onMounted, onBeforeUnmount, inject } from "vue";
import { ConfigProvider, Modal } from 'ant-design-vue';

const ModalComponent = defineComponent({
	props: {
		configProvider: Object,
		closeModal: Function,
		slots: Object,
	},
	setup(props) {

		const closeModal = () => {
			props.closeModal!()
		}
		provide('configProvider', props.configProvider)
		provide('modal', {
			close: closeModal
		})

		onMounted(() => {
			window.addEventListener('hashchange', closeModal); // 监听哈希值变化
			/*window.addEventListener('popstate', closeModal);   // 监听路径变化*/
		});

		// 组件卸载前移除事件监听器
		onBeforeUnmount(() => {
			window.removeEventListener('hashchange', closeModal);
			window.removeEventListener('popstate', closeModal);
		});

		return {}
	},
	render() {
		const modal = createVNode(Modal, this.$attrs, this.slots)
		return this.configProvider
			? createVNode(
				ConfigProvider,
				{
					...this.configProvider.value
				},
				{
					default: () => modal
				}
			)
			: modal
	}
})

interface ModalOptions {
	title?: string,
	width?: string,
	style?: Record<string, any>,
	onCancel?: () => any,
	onOk?: () => any,
	slots: Slot | Record<string, Slot | (() => VNode)>
}
interface Options {
	create?(modalOptions: ModalOptions): {
		close: () => void
	}
}
export function useModal(): Reactive<Required<Options>> {
	const instance = getCurrentInstance()
	console.assert(!!instance, 'getCurrentInstance无法获取到实例，请检查')
	const app = instance!.appContext.app
	const configProvider = inject('configProvider');

	const renderVNode = (vnode: VNode | null, rootContainer: Element): void => {
		if (vnode && !vnode.appContext) vnode.appContext = app._context
		render(vnode, rootContainer)
	}

	const state = reactive<Required<Options>>({
		create(modalOptions: ModalOptions) {
			const { slots, ...customMdalOptions } = modalOptions
			const slotsCache = {}
			const customSlots = Object.assign(
				{},
				...Object.keys(modalOptions.slots).map((key) => {
					return {
						[key]: () => {
							if (typeof (modalOptions.slots as any)?.[key] === 'function') {
								; (slotsCache as any)[key] ||= (modalOptions.slots as any)[key]()
							}
							return (slotsCache as any)[key]
						}
					}
				})
			);
			const modalVNode = createVNode(ModalComponent, {
				configProvider,
				closeModal: () => {
					close()
				},
				slots: customSlots,
				// 以下是透传modal支持的属性
				footer: false,
				open: true,
				...customMdalOptions,
				onCancel: async () => {
					await modalOptions.onCancel?.()
					close()
				},
				onOk: async () => {
					await modalOptions.onOk?.()
					close()
				},
			});
			// 创建一个独立的 Vue 实例
			const container = document.createElement('div');
			document.body.appendChild(container);

			modalVNode.appContext = instance!.appContext
			renderVNode(modalVNode, container);

			function close() {
				renderVNode(null, container)
				container.remove();
			}
			return {
				close
			}
		}
	})
	return state
}
