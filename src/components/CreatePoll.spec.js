import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CreatePoll from './CreatePoll.vue'
import { pollApi } from '../api/pollApi'

vi.mock('../api/pollApi', () => ({
  pollApi: { create: vi.fn() },
}))

describe('CreatePoll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent() {
    return mount(CreatePoll, {
      global: { stubs: { RouterLink: true } },
    })
  }

  function getCreateButton(wrapper) {
    return wrapper.findAll('button').find((b) => b.text().includes('Tao poll'))
  }

  function getAddOptionButton(wrapper) {
    return wrapper.findAll('button').find((b) => b.text().includes('Them lua chon'))
  }

  it('Error message displayed when no question is entered.', async () => {
    const wrapper = mountComponent()

    await getCreateButton(wrapper).trigger('click')
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.text()).toContain('Please enter your question.')
  })

  it('Report an error when a valid option is missing.', async () => {
    const wrapper = mountComponent()

    await wrapper.find('input').setValue('What color do you like?')
    await getCreateButton(wrapper).trigger('click')
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.text()).toContain('Please enter at least 2 options.')
  })

  it('tạo poll thành công khi nhập đủ dữ liệu', async () => {
    pollApi.create.mockResolvedValue({ code: 'ABC123' })

    const wrapper = mountComponent()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('What color do you like?')
    await inputs[1].setValue('Red')
    await inputs[2].setValue('Green')

    await getCreateButton(wrapper).trigger('click')
    await new Promise((r) => setTimeout(r, 0))

    expect(pollApi.create).toHaveBeenCalledWith('What color do you like?', ['Red', 'Green'])
    expect(wrapper.text()).toContain('Successfully created!')
    expect(wrapper.text()).toContain('ABC123')
  })

  it('Display an error when the create API fails.', async () => {
    pollApi.create.mockRejectedValue(new Error('Loi server'))

    const wrapper = mountComponent()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('What color do you like??')
    await inputs[1].setValue('Red')
    await inputs[2].setValue('Green')

    await getCreateButton(wrapper).trigger('click')
    await new Promise((r) => setTimeout(r, 0))

    expect(wrapper.text()).toContain('Loi server')
  })

  it('New options have been added, up to 6.', async () => {
    const wrapper = mountComponent()

    for (let i = 0; i < 4; i++) {
      await getAddOptionButton(wrapper).trigger('click')
    }

    expect(wrapper.findAll('input').length).toBe(7)

    expect(getAddOptionButton(wrapper)).toBeUndefined()
  })

  it('Selections can be deleted when there are more than two options.', async () => {
    const wrapper = mountComponent()

    await getAddOptionButton(wrapper).trigger('click')
    expect(wrapper.findAll('input').length).toBe(4) 

    const removeBtn = wrapper.findAll('button').find((b) => b.text() === 'X')
    expect(removeBtn).toBeTruthy()

    await removeBtn.trigger('click')
    expect(wrapper.findAll('input').length).toBe(3) 
  })

  it('Disable the "Create Poll" button while loading.', async () => {
    let resolveFn
    pollApi.create.mockReturnValue(
      new Promise((resolve) => {
        resolveFn = resolve
      })
    )

    const wrapper = mountComponent()
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('What color do you like??')
    await inputs[1].setValue('Red')
    await inputs[2].setValue('Green')

    const createBtn = getCreateButton(wrapper)
    await createBtn.trigger('click')

    expect(wrapper.text()).toContain('Creating...')
    expect(createBtn.attributes('disabled')).not.toBeUndefined()

    resolveFn({ code: 'XYZ999' })
    await new Promise((r) => setTimeout(r, 0))
  })
})
