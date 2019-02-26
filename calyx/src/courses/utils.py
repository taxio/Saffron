from contextlib import contextmanager


@contextmanager
def disable_signal(signal, receiver, sender=None, weak=True, dispatch_uid=None):
    signal.disconnect(receiver, sender, dispatch_uid=dispatch_uid)
    yield
    signal.connect(receiver, sender, weak=weak, dispatch_uid=dispatch_uid)
